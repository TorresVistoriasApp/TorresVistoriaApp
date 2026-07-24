import imageCompression from "browser-image-compression";

const STORAGE_BUCKET = "inspection-photos";

const MAX_DIMENSION = 1920;
const MAX_OUTPUT_BYTES = 2 * 1024 * 1024;
const QUALITY_STEPS = [0.85, 0.8, 0.75, 0.72] as const;
const WEB_WORKER_THRESHOLD_BYTES = 1_500_000;
const PREVIEW_MAX_SIDE = 320;
const DEFAULT_WEBP_QUALITY = 0.82;
const FALLBACK_WEBP_QUALITY = 0.72;

const HEIC_EXTENSIONS = new Set(["heic", "heif", "heics", "heifs"]);

export type ImageMetadata = {
  width: number;
  height: number;
  resolution: string;
  contentHash: string | null;
};

export function isHeicFile(file: File): boolean {
  const type = file.type.toLowerCase();
  if (type.includes("heic") || type.includes("heif")) return true;
  const ext = file.name.split(".").pop()?.toLowerCase();
  return ext ? HEIC_EXTENSIONS.has(ext) : false;
}

export function isSupportedImageFile(file: File): boolean {
  if (file.type.startsWith("image/")) return true;
  const ext = file.name.split(".").pop()?.toLowerCase();
  return ext ? ["jpg", "jpeg", "png", "webp", "gif", "bmp", "heic", "heif"].includes(ext) : false;
}

/** Redimensiona só quando o lado maior ultrapassa o limite; nunca faz upscale. */
export function scaleDimensions(width: number, height: number, maxSide: number) {
  if (width <= maxSide && height <= maxSide) {
    return { width, height };
  }
  const ratio = Math.min(maxSide / width, maxSide / height);
  return {
    width: Math.max(1, Math.round(width * ratio)),
    height: Math.max(1, Math.round(height * ratio)),
  };
}

/** Escolhe a menor qualidade da ladder cujo blob cabe no limite (ou a última). */
export function pickWebpQuality(blobSizes: number[], maxBytes: number): number {
  for (let i = 0; i < QUALITY_STEPS.length; i++) {
    if ((blobSizes[i] ?? Number.POSITIVE_INFINITY) <= maxBytes) {
      return QUALITY_STEPS[i];
    }
  }
  return QUALITY_STEPS[QUALITY_STEPS.length - 1];
}

function webpFileName(sourceName?: string): string {
  const base = sourceName?.replace(/\.[^.]+$/i, "") || "photo";
  return `${base}-${Date.now()}.webp`;
}

async function blobToWebPFile(blob: Blob, sourceName?: string): Promise<File> {
  return new File([blob], webpFileName(sourceName), { type: "image/webp" });
}

async function canvasEncodeWebP(
  source: ImageBitmap | HTMLImageElement,
  width: number,
  height: number,
  quality: number,
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Não foi possível processar a imagem.");

  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(source, 0, 0, width, height);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => (result ? resolve(result) : reject(new Error("Falha ao converter imagem."))),
      "image/webp",
      quality,
    );
  });
}

async function createImageBitmapResized(source: Blob): Promise<ImageBitmap> {
  return createImageBitmap(source, {
    resizeWidth: MAX_DIMENSION,
    resizeHeight: MAX_DIMENSION,
    resizeQuality: "medium",
  });
}

async function encodeBitmapToWebP(
  bitmap: ImageBitmap,
  quality: number,
  sourceName?: string,
): Promise<File> {
  const blob = await canvasEncodeWebP(bitmap, bitmap.width, bitmap.height, quality);
  return blobToWebPFile(blob, sourceName);
}

async function compressWithLibrary(file: File): Promise<File> {
  const compressed = await imageCompression(file, {
    maxWidthOrHeight: MAX_DIMENSION,
    maxSizeMB: MAX_OUTPUT_BYTES / (1024 * 1024),
    useWebWorker: file.size > WEB_WORKER_THRESHOLD_BYTES,
    fileType: "image/webp",
    initialQuality: DEFAULT_WEBP_QUALITY,
    alwaysKeepResolution: false,
    preserveExif: false,
  });

  return blobToWebPFile(compressed, file.name);
}

/** Fallback local: redimensiona no decode e encoda no máximo duas vezes. */
async function compressWithCanvas(source: File): Promise<File> {
  const bitmap = await createImageBitmapResized(source);
  try {
    const first = await encodeBitmapToWebP(bitmap, DEFAULT_WEBP_QUALITY, source.name);
    if (first.size <= MAX_OUTPUT_BYTES) return first;
    return encodeBitmapToWebP(bitmap, FALLBACK_WEBP_QUALITY, source.name);
  } finally {
    bitmap.close();
  }
}

async function convertHeicToJpeg(file: File): Promise<File> {
  const { default: heic2any } = await import("heic2any");
  const converted = await heic2any({
    blob: file,
    toType: "image/jpeg",
    quality: 0.9,
  });
  const blob = Array.isArray(converted) ? converted[0] : converted;
  const baseName = file.name.replace(/\.(heic|heif)$/i, "") || "foto";
  return new File([blob as Blob], `${baseName}.jpg`, { type: "image/jpeg" });
}

/**
 * Converte qualquer imagem suportada para WebP.
 * Caminho principal: browser-image-compression em Web Worker (arquivos > 1,5 MB).
 * Fallback: canvas com resize no decode e no máximo dois encodes.
 */
export async function compressToWebP(file: File): Promise<File> {
  if (!isSupportedImageFile(file)) {
    throw new Error("Arquivo inválido. Selecione uma imagem JPEG, PNG ou WebP.");
  }

  try {
    return await compressWithLibrary(file);
  } catch {
    return compressWithCanvas(file);
  }
}

/** Preview leve para UI otimista — evita decodificar a foto original em tela cheia. */
export async function createPreviewObjectUrl(file: File): Promise<string> {
  try {
    const bitmap = await createImageBitmap(file, {
      resizeWidth: PREVIEW_MAX_SIDE,
      resizeHeight: PREVIEW_MAX_SIDE,
      resizeQuality: "low",
    });
    try {
      const canvas = document.createElement("canvas");
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Não foi possível gerar preview.");

      ctx.drawImage(bitmap, 0, 0);
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((result) => resolve(result), "image/jpeg", 0.7);
      });
      if (!blob) throw new Error("Falha ao gerar preview.");
      return URL.createObjectURL(blob);
    } finally {
      bitmap.close();
    }
  } catch {
    return URL.createObjectURL(file);
  }
}

/** Prepara qualquer imagem da câmera ou galeria para upload (sempre WebP limpo). */
export async function preparePhotoForUpload(file: File): Promise<File> {
  if (!isSupportedImageFile(file)) {
    throw new Error("Formato não suportado. Use JPEG, PNG ou WebP.");
  }

  let source = file;
  if (isHeicFile(file)) {
    try {
      source = await convertHeicToJpeg(file);
    } catch {
      throw new Error(
        "Formato HEIC não pôde ser convertido. Salve a foto como JPEG na galeria ou use a câmera do app.",
      );
    }
  }

  if (source.type === "image/webp" && source.size <= MAX_OUTPUT_BYTES) {
    return source;
  }

  return compressToWebP(source);
}

export async function extractImageMetadata(file: File | Blob): Promise<ImageMetadata> {
  const bitmap = await createImageBitmap(file);
  const width = bitmap.width;
  const height = bitmap.height;
  bitmap.close();

  let contentHash: string | null = null;
  try {
    if (file.size <= 6 * 1024 * 1024) {
      const buffer = await file.arrayBuffer();
      const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      contentHash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    }
  } catch {
    contentHash = null;
  }

  return {
    width,
    height,
    resolution: `${width}x${height}`,
    contentHash,
  };
}

export function getDeviceInfo(): { deviceModel: string; deviceOs: string } {
  const ua = navigator.userAgent;
  let deviceOs = "Desconhecido";
  if (/Android/i.test(ua)) deviceOs = "Android";
  else if (/iPhone|iPad|iPod/i.test(ua)) deviceOs = "iOS";
  else if (/Windows/i.test(ua)) deviceOs = "Windows";
  else if (/Mac/i.test(ua)) deviceOs = "macOS";
  else if (/Linux/i.test(ua)) deviceOs = "Linux";

  return { deviceModel: ua.slice(0, 200), deviceOs };
}

export function buildPhotoPath(
  companyId: string,
  inspectionId: string,
  category: string,
  fileName: string,
): string {
  return `${companyId}/${inspectionId}/${category}/${fileName}`;
}

export { STORAGE_BUCKET, MAX_DIMENSION, MAX_OUTPUT_BYTES, QUALITY_STEPS };
