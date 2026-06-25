import { db } from "@/lib/db-client";
import { AppError, getErrorMessage, throwIfEdgeError } from "@/lib/errors";
import type { Inspection } from "@/services/inspection-service";
import type { ChecklistItem } from "@/services/checklist-service";
import type { InspectionPhoto } from "@/services/photo-service";
import { buildLaudoDocDefinition } from "@/lib/laudo/laudo-doc-definition";
import type { LaudoCompany, LaudoInspector, LaudoPayload, LaudoSettings } from "@/lib/laudo/laudo-model";
import { PUBLIC_IMAGES } from "@/lib/public-images";
import { getBrandLogoPath } from "@/lib/vehicle-brand-logos";
import { buildVerificationCode } from "@/lib/laudo/verification-code";

const REPORTS_BUCKET = "reports";

async function sha256Bytes(data: Blob | string): Promise<string> {
  const buffer = typeof data === "string" ? new TextEncoder().encode(data) : await data.arrayBuffer();
  const hash = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function generateVerificationCode(inspection: Inspection, version = 1): string {
  return buildVerificationCode(inspection.inspection_number, new Date(), version);
}

async function imageUrlToJpegDataUrl(
  url: string,
  maxWidth = 1200,
  maxHeight = 1200,
): Promise<string | undefined> {
  try {
    const response = await fetch(url);
    if (!response.ok) return undefined;
    const blob = await response.blob();
    const bitmap = await createImageBitmap(blob);
    const scale = Math.min(maxWidth / bitmap.width, maxHeight / bitmap.height, 1);
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return undefined;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close?.();
    return canvas.toDataURL("image/jpeg", 0.82);
  } catch {
    return undefined;
  }
}

async function loadPhotoDataUrls(photos: InspectionPhoto[]) {
  return Promise.all(
    photos.map(async (photo) => ({
      ...photo,
      dataUrl: photo.public_url ? await imageUrlToJpegDataUrl(photo.public_url, 960, 720) : undefined,
    })),
  );
}

async function getPdfMake() {
  const pdfMake = await import("pdfmake/build/pdfmake");
  const pdfFonts = await import("pdfmake/build/vfs_fonts");
  const pdfDoc = pdfMake.default ?? pdfMake;
  const fonts = (pdfFonts as { default?: { pdfMake?: { vfs: unknown } } }).default?.pdfMake?.vfs;
  if (fonts) {
    (pdfDoc as { vfs?: unknown }).vfs = fonts;
  }
  return pdfDoc as {
    createPdf: (def: unknown) => {
      download: (n: string) => void;
      getBlob: (cb: (blob: Blob) => void) => void;
    };
  };
}

function reportFileName(inspection: Inspection): string {
  const safePlate = inspection.plate.replace(/[^A-Z0-9]/gi, "").toUpperCase();
  return `laudo-${inspection.inspection_number}-${safePlate}.pdf`;
}

/** pdfmake mutates image nodes in-place; clone before a second render pass. */
function cloneDocDefinition(docDefinition: Record<string, unknown>): Record<string, unknown> {
  const footer = docDefinition.footer;
  const cloned = JSON.parse(JSON.stringify(docDefinition)) as Record<string, unknown>;
  if (typeof footer === "function") {
    cloned.footer = footer;
  }
  return cloned;
}

export const pdfService = {
  async fetchInspectionPayload(inspectionId: string) {
    try {
      const { data, error } = await db.functions.invoke("generate-pdf", {
        body: { inspectionId },
      });
      return throwIfEdgeError(error, data as Record<string, unknown> | null);
    } catch (error) {
      throw new AppError(getErrorMessage(error));
    }
  },

  async getReportPdfUrl(inspectionId: string) {
    try {
      const { data, error } = await db
        .from("inspection_reports")
        .select("storage_path, verification_code, integrity_hash, created_at, version")
        .eq("inspection_id", inspectionId)
        .is("deleted_at", null)
        .order("version", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    } catch (error) {
      throw new AppError(getErrorMessage(error));
    }
  },

  async downloadPdf(storagePath: string): Promise<Blob> {
    try {
      const { data, error } = await db.storage.from("reports").download(storagePath);
      if (error) throw error;
      if (!data) throw new AppError("Arquivo PDF não encontrado");
      return data;
    } catch (error) {
      throw new AppError(getErrorMessage(error));
    }
  },

  async generateLaudoPayload(
    inspection: Inspection,
    checklist: ChecklistItem[],
    photos: InspectionPhoto[] = [],
    options: {
      company?: LaudoCompany | null;
      settings?: LaudoSettings | null;
      inspector?: LaudoInspector | null;
      verificationCode?: string;
      integrityHash?: string;
      validationUrl?: string;
    } = {},
  ): Promise<{
    verificationCode: string;
    integrityHash: string;
    docDefinition: Record<string, unknown>;
    payload: LaudoPayload;
  }> {
    const verificationCode =
      options.verificationCode ?? generateVerificationCode(inspection);
    const baseHash =
      options.integrityHash ??
      (await sha256Bytes(JSON.stringify({ inspection, checklist, photos, verificationCode })));
    const brandLogoPath = getBrandLogoPath(inspection.brand);
    const payload: LaudoPayload = {
      inspection,
      checklist,
      photos: await loadPhotoDataUrls(photos),
      company: options.company,
      settings: options.settings,
      inspector: options.inspector,
      verificationCode,
      integrityHash: baseHash,
      validationUrl: options.validationUrl,
      logoDataUrl: await imageUrlToJpegDataUrl(PUBLIC_IMAGES.brand.trim, 320, 128),
      brandLogoDataUrl: brandLogoPath ? await imageUrlToJpegDataUrl(brandLogoPath, 240, 120) : undefined,
      generatedAt: new Date(),
    };

    return {
      verificationCode,
      integrityHash: baseHash,
      docDefinition: buildLaudoDocDefinition(payload),
      payload,
    };
  },

  async downloadLaudo(docDefinition: Record<string, unknown>, fileName: string): Promise<void> {
    try {
      const pdfDoc = await getPdfMake();
      pdfDoc.createPdf(cloneDocDefinition(docDefinition)).download(fileName);
    } catch (error) {
      throw new AppError(getErrorMessage(error));
    }
  },

  async downloadPdfBlob(blob: Blob, fileName: string): Promise<void> {
    const url = URL.createObjectURL(blob);
    try {
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = fileName;
      anchor.rel = "noopener";
      anchor.click();
    } finally {
      URL.revokeObjectURL(url);
    }
  },

  async createPdfBlob(docDefinition: Record<string, unknown>): Promise<Blob> {
    try {
      const pdfDoc = await getPdfMake();
      return await new Promise<Blob>((resolve) => {
        pdfDoc.createPdf(cloneDocDefinition(docDefinition)).getBlob(resolve);
      });
    } catch (error) {
      throw new AppError(getErrorMessage(error));
    }
  },

  async registerProfessionalLaudo(params: {
    inspection: Inspection;
    checklist: ChecklistItem[];
    photos: InspectionPhoto[];
    company?: LaudoCompany | null;
    settings?: LaudoSettings | null;
    inspector?: LaudoInspector | null;
    validationBaseUrl?: string;
  }): Promise<{ verificationCode: string; integrityHash: string; storagePath: string }> {
    try {
      const existingReport = await this.getReportPdfUrl(params.inspection.id);
      const nextVersion = (existingReport?.version ?? 0) + 1;
      const verificationCode = generateVerificationCode(params.inspection, nextVersion);
      const validationUrl = `${params.validationBaseUrl ?? window.location.origin}/validar/${encodeURIComponent(verificationCode)}`;
      const firstPass = await this.generateLaudoPayload(params.inspection, params.checklist, params.photos, {
        company: params.company,
        settings: params.settings,
        inspector: params.inspector,
        verificationCode,
        validationUrl,
      });
      const firstBlob = await this.createPdfBlob(firstPass.docDefinition);
      const integrityHash = await sha256Bytes(firstBlob);
      const finalPass = await this.generateLaudoPayload(params.inspection, params.checklist, params.photos, {
        company: params.company,
        settings: params.settings,
        inspector: params.inspector,
        verificationCode,
        integrityHash,
        validationUrl,
      });
      const finalBlob = await this.createPdfBlob(finalPass.docDefinition);
      const storagePath = `${params.inspection.company_id}/${params.inspection.id}/${Date.now()}-${reportFileName(params.inspection)}`;

      const { error: uploadError } = await db.storage
        .from(REPORTS_BUCKET)
        .upload(storagePath, finalBlob, { contentType: "application/pdf", upsert: false });
      if (uploadError) throw uploadError;

      const { data: publicUrl } = db.storage.from(REPORTS_BUCKET).getPublicUrl(storagePath);

      const { error: reportError } = await db.functions.invoke("create-report", {
        body: {
          inspectionId: params.inspection.id,
          storagePath,
          verificationCode,
          integrityHash,
          qrCodeData: validationUrl,
          publicUrl: publicUrl.publicUrl,
        },
      });
      if (reportError) throw reportError;

      await this.downloadPdfBlob(finalBlob, reportFileName(params.inspection));

      return { verificationCode, integrityHash, storagePath };
    } catch (error) {
      throw new AppError(getErrorMessage(error));
    }
  },
};
