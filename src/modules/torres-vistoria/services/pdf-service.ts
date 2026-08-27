import { db } from "@/infra/supabase/client";
import { AppError, getEdgeErrorMessage, getErrorMessage, throwIfEdgeError } from "@/core/errors/app-error";
import type { Inspection } from "@/modules/torres-vistoria/services/inspection-service";
import type { ChecklistItem } from "@/modules/torres-vistoria/services/checklist-service";
import type { InspectionPhoto } from "@/modules/torres-vistoria/services/photo-service";
import { withSignedPhotoUrls } from "@/modules/torres-vistoria/services/photo-service";
import { PDF_TABLE_LAYOUTS } from "@/modules/torres-vistoria/domain/laudo/pdf/pdf-table-layouts";
import { ensureLaudoPdfFonts, resolveLaudoPdfFont } from "@/modules/torres-vistoria/domain/laudo/pdf/pdf-fonts";
import { buildLaudoDocDefinition } from "@/modules/torres-vistoria/domain/laudo/laudo-doc-definition";
import type { LaudoCompany, LaudoInspector, LaudoPayload, LaudoPhoto, LaudoSettings } from "@/modules/torres-vistoria/domain/laudo/laudo-model";
import { SILHOUETTE_HEIGHT, SILHOUETTE_WIDTH } from "@/modules/torres-vistoria/domain/laudo/pdf/paint-silhouette";
import { PUBLIC_IMAGES } from "@/shared/lib/public-images";
import {
  blobToPdfDataUrl,
  imageUrlToPdfDataUrl,
  mapWithConcurrency,
} from "@/shared/lib/pdf-embed-image";
import { optimizePdfBlob } from "@/shared/lib/optimize-pdf";
import { getBrandLogoPath } from "@/modules/torres-vistoria/domain/vehicle-brand-logos";
import { buildVerificationCode, formatLaudoNumber } from "@/modules/torres-vistoria/domain/laudo/verification-code";
import {
  LAUDO_SECTION_ICON_PATHS,
  type LaudoSectionIconDataUrls,
} from "@/modules/torres-vistoria/domain/laudo/pdf/section-icons";
import type { PdfIconName } from "@/modules/torres-vistoria/domain/laudo/pdf/pdf-icons";
import { REPORTS_BUCKET, STORAGE_BUCKET } from "@/infra/storage/buckets";
import {
  buildInspectionPhotoThumbnailPath,
  buildReportStoragePath,
} from "@/infra/storage/paths";

/**
 * A logo ocupa 108pt de largura no cabeçalho compacto do laudo; rasterizar o
 * vetor a 4x garante ~288 DPI na impressão.
 */
const LOGO_PRINT_WIDTH_PX = 448;
/** Silhueta 132pt — 10× (~720 DPI) para o traço ficar nítido na impressão. */
const VEHICLE_TOP_VIEW_PRINT_WIDTH_PX = 1320;
/** Intro no PDF é ~48pt — 192px basta (~4×) sem inflar o payload. */
const SECTION_ICON_PRINT_PX = 192;

/** Poucas em paralelo: decode WebP+canvas em massa falhava em parte das fotos. */
const PHOTO_EMBED_CONCURRENCY = 4;

const PHOTO_EMBED_OPTIONS = {
  maxWidth: 560,
  maxHeight: 420,
  preferAlpha: false,
  jpegQuality: 0.72,
} as const;

type StaticLaudoAssets = {
  logoDataUrl?: string;
  vehicleTopViewDataUrl?: string;
  sectionIconDataUrls: LaudoSectionIconDataUrls;
};

let staticAssetsCache: Promise<StaticLaudoAssets> | null = null;
/** Evita re-embed ao clicar nos dois botões ou reemitir na mesma sessão. */
const photoEmbedCache = new Map<string, string>();

function photoEmbedCacheKey(photo: InspectionPhoto): string {
  return photo.id || photo.storage_path || photo.public_url || "";
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = window.setTimeout(() => {
      reject(new Error(`${label} excedeu ${Math.round(ms / 1000)}s`));
    }, ms);
    promise.then(
      (value) => {
        window.clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        window.clearTimeout(timer);
        reject(error);
      },
    );
  });
}

async function loadSectionIconDataUrls(): Promise<LaudoSectionIconDataUrls> {
  // Carrega cada arquivo uma vez e replica nas chaves lógicas (shield→authenticity…).
  const uniquePaths = [...new Set(Object.values(LAUDO_SECTION_ICON_PATHS))];
  const byPath = new Map<string, string>();

  await mapWithConcurrency(uniquePaths, 4, async (path) => {
    const dataUrl = await imageUrlToPdfDataUrl(path, {
      maxWidth: SECTION_ICON_PRINT_PX,
      maxHeight: SECTION_ICON_PRINT_PX,
      preferAlpha: true,
    });
    if (dataUrl) byPath.set(path, dataUrl);
  });

  const icons: LaudoSectionIconDataUrls = {};
  for (const [key, path] of Object.entries(LAUDO_SECTION_ICON_PATHS) as Array<
    [PdfIconName, string]
  >) {
    const dataUrl = byPath.get(path);
    if (dataUrl) icons[key] = dataUrl;
  }
  return icons;
}

async function loadStaticLaudoAssets(): Promise<StaticLaudoAssets> {
  if (!staticAssetsCache) {
    staticAssetsCache = (async () => {
      const [logoDataUrl, vehicleTopViewDataUrl, sectionIconDataUrls] = await Promise.all([
        imageUrlToPdfDataUrl(PUBLIC_IMAGES.brand.lockup, {
          maxWidth: LOGO_PRINT_WIDTH_PX,
          maxHeight: LOGO_PRINT_WIDTH_PX,
          preferAlpha: true,
        }),
        imageUrlToPdfDataUrl(PUBLIC_IMAGES.laudo.vehicleTopView, {
          maxWidth: VEHICLE_TOP_VIEW_PRINT_WIDTH_PX,
          maxHeight: Math.round(
            VEHICLE_TOP_VIEW_PRINT_WIDTH_PX * (SILHOUETTE_HEIGHT / SILHOUETTE_WIDTH),
          ),
          preferAlpha: true,
          cache: "reload",
        }),
        loadSectionIconDataUrls(),
      ]);
      return {
        logoDataUrl,
        vehicleTopViewDataUrl,
        sectionIconDataUrls,
      };
    })().catch((error) => {
      staticAssetsCache = null;
      throw error;
    });
  }
  return staticAssetsCache;
}

async function sha256Bytes(data: Blob | string): Promise<string> {
  const buffer = typeof data === "string" ? new TextEncoder().encode(data) : await data.arrayBuffer();
  const hash = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Hash estável do conteúdo da vistoria (exibido no PDF).
 * Diferente do hash do arquivo PDF, usado na validação pública.
 */
async function buildContentIntegrityHash(input: {
  verificationCode: string;
  inspection: Inspection;
  checklist: ChecklistItem[];
  photos: InspectionPhoto[];
}): Promise<string> {
  const fingerprint = {
    verificationCode: input.verificationCode,
    inspectionId: input.inspection.id,
    inspectionNumber: input.inspection.inspection_number,
    opinion: input.inspection.opinion,
    plate: input.inspection.plate,
    checklist: input.checklist.map((item) => ({
      id: item.id,
      status: item.status,
      notes: item.notes,
    })),
    photos: input.photos.map((photo) => ({
      id: photo.id,
      category: photo.category,
      path: photo.storage_path,
    })),
  };
  return sha256Bytes(JSON.stringify(fingerprint));
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

async function downloadStorageBlob(path: string): Promise<Blob | null> {
  try {
    const { data, error } = await withTimeout(
      db.storage.from(STORAGE_BUCKET).download(path),
      30_000,
      `Download da foto ${path}`,
    );
    if (error || !data || data.size < 32) return null;
    return data;
  } catch {
    return null;
  }
}

async function embedBlobWithRetry(
  blob: Blob,
  mimeHint?: string,
): Promise<string | undefined> {
  const options = { ...PHOTO_EMBED_OPTIONS, mimeHint };
  const first = await blobToPdfDataUrl(blob, options);
  if (first) return first;
  return blobToPdfDataUrl(blob, options);
}

function isUsablePhotoUrl(url: string | null | undefined): url is string {
  if (!url) return false;
  return (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("blob:") ||
    url.startsWith("data:")
  );
}

/**
 * Incorpora fotos para o PDF.
 * Preserva URLs já assinadas da UI; só completa as que faltam.
 * Nunca substitui uma URL http(s)/blob válida por null.
 */
async function loadPhotoDataUrls(photos: InspectionPhoto[]): Promise<LaudoPhoto[]> {
  if (photos.length === 0) return [];

  const allHaveEmbed = photos.every((photo) => Boolean((photo as LaudoPhoto).dataUrl));
  let sourcePhotos = photos;

  if (!allHaveEmbed) {
    const refreshed = await withSignedPhotoUrls(photos);
    sourcePhotos = photos.map((photo, index) => {
      const next = refreshed[index] ?? photo;
      return {
        ...photo,
        // Mantém URL da tela se a reassinatura falhar (evita zerar todas as fotos).
        public_url: isUsablePhotoUrl(next.public_url)
          ? next.public_url
          : isUsablePhotoUrl(photo.public_url)
            ? photo.public_url
            : next.public_url,
        thumbnail_url: isUsablePhotoUrl(next.thumbnail_url)
          ? next.thumbnail_url
          : isUsablePhotoUrl(photo.thumbnail_url)
            ? photo.thumbnail_url
            : next.thumbnail_url,
      };
    });
  }

  return mapWithConcurrency(sourcePhotos, PHOTO_EMBED_CONCURRENCY, async (photo) => {
    const existing = (photo as LaudoPhoto).dataUrl;
    if (existing) return { ...photo, dataUrl: existing };

    const cacheKey = photoEmbedCacheKey(photo);
    if (cacheKey) {
      const cached = photoEmbedCache.get(cacheKey);
      if (cached) return { ...photo, dataUrl: cached };
    }

    let dataUrl: string | undefined;

    if (isUsablePhotoUrl(photo.public_url)) {
      dataUrl = await imageUrlToPdfDataUrl(photo.public_url, {
        ...PHOTO_EMBED_OPTIONS,
        mimeHint: photo.mime_type,
      });
    }

    if (!dataUrl && photo.storage_path) {
      const full = await downloadStorageBlob(photo.storage_path);
      if (full) dataUrl = await embedBlobWithRetry(full, photo.mime_type);
    }

    if (!dataUrl && isUsablePhotoUrl(photo.thumbnail_url)) {
      dataUrl = await imageUrlToPdfDataUrl(photo.thumbnail_url, {
        ...PHOTO_EMBED_OPTIONS,
        mimeHint: photo.mime_type,
      });
    }

    if (!dataUrl && photo.storage_path) {
      const thumb = await downloadStorageBlob(
        buildInspectionPhotoThumbnailPath(photo.storage_path),
      );
      if (thumb) dataUrl = await embedBlobWithRetry(thumb, photo.mime_type);
    }

    if (dataUrl && cacheKey) {
      photoEmbedCache.set(cacheKey, dataUrl);
    }

    return { ...photo, dataUrl };
  });
}

async function getPdfMake() {
  const pdfMake = await import("pdfmake/build/pdfmake");
  const pdfFonts = await import("pdfmake/build/vfs_fonts");
  const pdfDoc = pdfMake.default ?? pdfMake;
  const fontsModule = pdfFonts as {
    default?: { pdfMake?: { vfs: Record<string, string> }; vfs?: Record<string, string> };
    pdfMake?: { vfs: Record<string, string> };
    vfs?: Record<string, string>;
  };
  const fonts =
    fontsModule.default?.pdfMake?.vfs ??
    fontsModule.default?.vfs ??
    fontsModule.pdfMake?.vfs ??
    fontsModule.vfs;
  if (fonts) {
    (pdfDoc as { vfs?: unknown }).vfs = fonts;
  }
  const sourceSansReady = await ensureLaudoPdfFonts(
    pdfDoc as Parameters<typeof ensureLaudoPdfFonts>[0],
  );
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
  return { engine, sourceSansReady };
}

function reportFileName(inspection: Inspection): string {
  const safePlate = inspection.plate.replace(/[^A-Z0-9]/gi, "").toUpperCase();
  return `laudo-${inspection.inspection_number}-${safePlate}.pdf`;
}

export const pdfService = {
  /** Aquece assets estáticos (chame na tela de revisão). Fontes custom ficam desligadas por padrão. */
  async prefetchAssets(): Promise<void> {
    await loadStaticLaudoAssets();
  },

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
      /** Assets já embutidos — evita refetch na 2ª passagem do laudo. */
      staticAssets?: StaticLaudoAssets;
      /** Fotos já com dataUrl — evita re-embed. */
      photosAlreadyEmbedded?: boolean;
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

    const [staticAssets, embeddedPhotos, brandLogoDataUrl] = await Promise.all([
      options.staticAssets ?? loadStaticLaudoAssets(),
      options.photosAlreadyEmbedded
        ? Promise.resolve(photos as LaudoPhoto[])
        : loadPhotoDataUrls(photos),
      brandLogoPath
        ? imageUrlToPdfDataUrl(brandLogoPath, {
            maxWidth: 240,
            maxHeight: 120,
            preferAlpha: true,
          })
        : Promise.resolve(undefined),
    ]);

    const payload: LaudoPayload = {
      inspection,
      checklist,
      photos: embeddedPhotos,
      company: options.company,
      settings: options.settings,
      inspector: options.inspector,
      laudoNumber,
      verificationCode,
      integrityHash: baseHash,
      validationUrl: options.validationUrl,
      logoDataUrl: staticAssets.logoDataUrl,
      brandLogoDataUrl,
      vehicleTopViewDataUrl: staticAssets.vehicleTopViewDataUrl,
      sectionIconDataUrls: staticAssets.sectionIconDataUrls,
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

  async createPdfBlob(
    docDefinition: Record<string, unknown>,
    options: { optimize?: boolean } = {},
  ): Promise<Blob> {
    try {
      const { engine, sourceSansReady } = await getPdfMake();
      const fontFamily = resolveLaudoPdfFont(sourceSansReady);
      const defaultStyle = {
        ...((docDefinition.defaultStyle as Record<string, unknown> | undefined) ?? {}),
        font: fontFamily,
      };
      const definition = { ...docDefinition, defaultStyle };

      // Cede à UI antes do layout síncrono pesado do pdfmake.
      await new Promise<void>((resolve) => {
        window.setTimeout(resolve, 0);
      });

      const rawBlob = await withTimeout(
        new Promise<Blob>((resolve, reject) => {
          let settled = false;
          const fail = (error: unknown) => {
            if (settled) return;
            settled = true;
            reject(error instanceof Error ? error : new Error(String(error)));
          };
          try {
            const pdfDoc = engine.createPdf(definition, PDF_TABLE_LAYOUTS);
            pdfDoc.getBlob((blob) => {
              if (settled) return;
              settled = true;
              if (!blob || blob.size === 0) {
                reject(new Error("PDF vazio — falha na geração"));
                return;
              }
              resolve(blob);
            });
          } catch (error) {
            fail(error);
          }
        }),
        180_000,
        "Geração do PDF",
      );

      if (options.optimize !== true) return rawBlob;
      return withTimeout(optimizePdfBlob(rawBlob), 45_000, "Otimização do PDF");
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

      const [staticAssets, photosWithEmbeds, contentHash] = await Promise.all([
        loadStaticLaudoAssets(),
        loadPhotoDataUrls(params.photos),
        buildContentIntegrityHash({
          verificationCode,
          inspection: params.inspection,
          checklist: params.checklist,
          photos: params.photos,
        }),
      ]);

      const { docDefinition } = await this.generateLaudoPayload(
        params.inspection,
        params.checklist,
        photosWithEmbeds,
        {
          company: params.company,
          settings: params.settings,
          inspector: params.inspector,
          verificationCode,
          validationUrl,
          integrityHash: contentHash,
          staticAssets,
          photosAlreadyEmbedded: true,
        },
      );

      const finalBlob = await this.createPdfBlob(docDefinition);
      const fileIntegrityHash = await sha256Bytes(finalBlob);
      const fileName = reportFileName(params.inspection);

      // Baixa primeiro — libera o loading mesmo se upload/edge demorarem.
      await this.downloadPdfBlob(finalBlob, fileName);

      const storagePath = buildReportStoragePath(
        params.inspection.tenant_id,
        params.inspection.id,
        `${Date.now()}-${fileName}`,
      );

      try {
        await withTimeout(
          (async () => {
            const { error: uploadError } = await db.storage
              .from(REPORTS_BUCKET)
              .upload(storagePath, finalBlob, { contentType: "application/pdf", upsert: false });
            if (uploadError) throw uploadError;

            const { error: reportError } = await db.functions.invoke("create-report", {
              body: {
                inspectionId: params.inspection.id,
                storagePath,
                verificationCode,
                integrityHash: fileIntegrityHash,
                qrCodeData: validationUrl,
                publicUrl: null,
              },
            });
            if (reportError) throw new AppError(await getEdgeErrorMessage(reportError));
          })(),
          90_000,
          "Registro do laudo",
        );
      } catch (registerError) {
        // PDF já foi baixado — não manter spinner infinito por falha de registro.
        throw new AppError(
          `PDF baixado, mas o registro falhou: ${getErrorMessage(registerError)}`,
        );
      }

      return {
        verificationCode,
        integrityHash: fileIntegrityHash,
        storagePath,
      };
    } catch (error) {
      throw new AppError(getErrorMessage(error));
    }
  },
};
