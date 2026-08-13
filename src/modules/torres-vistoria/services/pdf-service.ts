import { db } from "@/infra/supabase/client";
import { AppError, getEdgeErrorMessage, getErrorMessage, throwIfEdgeError } from "@/core/errors/app-error";
import type { Inspection } from "@/modules/torres-vistoria/services/inspection-service";
import type { ChecklistItem } from "@/modules/torres-vistoria/services/checklist-service";
import type { InspectionPhoto } from "@/modules/torres-vistoria/services/photo-service";
import { PDF_TABLE_LAYOUTS } from "@/modules/torres-vistoria/domain/laudo/pdf/pdf-table-layouts";
import { buildLaudoDocDefinition } from "@/modules/torres-vistoria/domain/laudo/laudo-doc-definition";
import type { LaudoCompany, LaudoInspector, LaudoPayload, LaudoSettings } from "@/modules/torres-vistoria/domain/laudo/laudo-model";
import { SILHOUETTE_HEIGHT, SILHOUETTE_WIDTH } from "@/modules/torres-vistoria/domain/laudo/pdf/paint-silhouette";
import { PUBLIC_IMAGES } from "@/shared/lib/public-images";
import { imageUrlToPdfDataUrl } from "@/shared/lib/pdf-embed-image";
import { optimizePdfBlob } from "@/shared/lib/optimize-pdf";
import { getBrandLogoPath } from "@/modules/torres-vistoria/domain/vehicle-brand-logos";
import { buildVerificationCode, formatLaudoNumber } from "@/modules/torres-vistoria/domain/laudo/verification-code";
import { REPORTS_BUCKET } from "@/infra/storage/buckets";
import { buildReportStoragePath } from "@/infra/storage/paths";

/**
 * A logo ocupa 108pt de largura no cabeçalho compacto do laudo; rasterizar o
 * vetor a 4x garante ~288 DPI na impressão.
 */
const LOGO_PRINT_WIDTH_PX = 448;
const VEHICLE_TOP_VIEW_PRINT_WIDTH_PX = 704;

async function sha256Bytes(data: Blob | string): Promise<string> {
  const buffer = typeof data === "string" ? new TextEncoder().encode(data) : await data.arrayBuffer();
  const hash = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Reutiliza o código ativo em reemissões; senão gera um opaco. */
async function resolveVerificationCode(inspectionId: string): Promise<string> {
  const { data } = await db
    .from("inspection_reports")
    .select("verification_code")
    .eq("inspection_id", inspectionId)
    .is("deleted_at", null)
    .order("version", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (data?.verification_code) return data.verification_code;
  return buildVerificationCode();
}

async function loadPhotoDataUrls(photos: InspectionPhoto[]) {
  return Promise.all(
    photos.map(async (photo) => ({
      ...photo,
      dataUrl: photo.public_url
        ? await imageUrlToPdfDataUrl(photo.public_url, {
            maxWidth: 960,
            maxHeight: 720,
            preferAlpha: false,
            jpegQuality: 0.8,
          })
        : undefined,
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
  const engine = pdfDoc as {
    tableLayouts?: Record<string, unknown>;
    createPdf: (
      def: unknown,
      tableLayouts?: unknown,
    ) => {
      download: (n: string) => void;
      getBlob: (cb: (blob: Blob) => void) => void;
    };
  };
  engine.tableLayouts = { ...engine.tableLayouts, ...PDF_TABLE_LAYOUTS };
  return engine;
}

function reportFileName(inspection: Inspection): string {
  const safePlate = inspection.plate.replace(/[^A-Z0-9]/gi, "").toUpperCase();
  return `laudo-${inspection.inspection_number}-${safePlate}.pdf`;
}

/** pdfmake mutates image nodes in-place; clone before a second render pass. */
function cloneDocDefinition(docDefinition: Record<string, unknown>): Record<string, unknown> {
  const header = docDefinition.header;
  const footer = docDefinition.footer;
  const cloned = JSON.parse(JSON.stringify(docDefinition)) as Record<string, unknown>;
  if (typeof header === "function") cloned.header = header;
  if (typeof footer === "function") cloned.footer = footer;
  return cloned;
}

export const pdfService = {
  async fetchInspectionPayload(inspectionId: string) {
    try {
      const { data, error } = await db.functions.invoke("generate-pdf", {
        body: { inspectionId },
      });
      return await throwIfEdgeError(error, data as Record<string, unknown> | null);
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
      options.verificationCode ?? buildVerificationCode();
    const laudoNumber = formatLaudoNumber(
      inspection.inspection_number,
      inspection.inspection_date,
    );
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
      laudoNumber,
      verificationCode,
      integrityHash: baseHash,
      validationUrl: options.validationUrl,
      logoDataUrl: await imageUrlToPdfDataUrl(PUBLIC_IMAGES.brand.lockup, {
        maxWidth: LOGO_PRINT_WIDTH_PX,
        maxHeight: LOGO_PRINT_WIDTH_PX,
        preferAlpha: true,
      }),
      brandLogoDataUrl: brandLogoPath
        ? await imageUrlToPdfDataUrl(brandLogoPath, {
            maxWidth: 240,
            maxHeight: 120,
            preferAlpha: true,
          })
        : undefined,
      vehicleTopViewDataUrl: await imageUrlToPdfDataUrl(PUBLIC_IMAGES.laudo.vehicleTopView, {
        maxWidth: VEHICLE_TOP_VIEW_PRINT_WIDTH_PX,
        maxHeight: Math.round(VEHICLE_TOP_VIEW_PRINT_WIDTH_PX * (SILHOUETTE_HEIGHT / SILHOUETTE_WIDTH)),
        preferAlpha: true,
      }),
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
      const blob = await this.createPdfBlob(docDefinition);
      await this.downloadPdfBlob(blob, fileName);
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
      const rawBlob = await new Promise<Blob>((resolve) => {
        pdfDoc.createPdf(cloneDocDefinition(docDefinition), PDF_TABLE_LAYOUTS).getBlob(resolve);
      });
      return optimizePdfBlob(rawBlob);
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
      const verificationCode = await resolveVerificationCode(params.inspection.id);
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
      const storagePath = buildReportStoragePath(
        params.inspection.tenant_id,
        params.inspection.id,
        `${Date.now()}-${reportFileName(params.inspection)}`,
      );

      const { error: uploadError } = await db.storage
        .from(REPORTS_BUCKET)
        .upload(storagePath, finalBlob, { contentType: "application/pdf", upsert: false });
      if (uploadError) throw uploadError;

      // O bucket de laudos é privado: o download sai do blob em memória e a
      // validação pública lê pelo storage_path no servidor. Uma URL pública aqui
      // só serviria para expor o PDF completo sem autenticação.
      const { error: reportError } = await db.functions.invoke("create-report", {
        body: {
          inspectionId: params.inspection.id,
          storagePath,
          verificationCode,
          integrityHash,
          qrCodeData: validationUrl,
          publicUrl: null,
        },
      });
      if (reportError) throw new AppError(await getEdgeErrorMessage(reportError));

      await this.downloadPdfBlob(finalBlob, reportFileName(params.inspection));

      return { verificationCode, integrityHash, storagePath };
    } catch (error) {
      throw new AppError(getErrorMessage(error));
    }
  },
};
