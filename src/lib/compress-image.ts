import imageCompression from "browser-image-compression";

const STORAGE_BUCKET = "inspection-photos";

const MAX_DIMENSION = 1920;
const MAX_OUTPUT_BYTES = 2 * 1024 * 1024;
const QUALITY_STEPS = [0.85, 0.8, 0.75, 0.72] as const;
const WEB_WORKER_THRESHOLD_BYTES = 1_500_000;

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

  // Sem fill branco: preserva canal alpha quando existir.
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

async function encodeWebPWithQualityLadder(
  source: ImageBitmap | HTMLImageElement,
  width: number,
  height: number,
  sourceName?: string,
): Promise<File> {
  let bestBlob: Blob | null = null;

  for (const quality of QUALITY_STEPS) {
    const blob = await canvasEncodeWebP(source, width, height, quality);
    bestBlob = blob;
    if (blob.size <= MAX_OUTPUT_BYTES) {
      return blobToWebPFile(blob, sourceName);
    }
  }

  if (!bestBlob) throw new Error("Falha ao converter imagem.");
  return blobToWebPFile(bestBlob, sourceName);
}

async function compressWithLibrary(file: File): Promise<File> {
  const compressed = await imageCompression(file, {
    maxWidthOrHeight: MAX_DIMENSION,
    maxSizeMB: MAX_OUTPUT_BYTES / (1024 * 1024),
    useWebWorker: file.size > WEB_WORKER_THRESHOLD_BYTES,
    fileType: "image/webp",
    initialQuality: QUALITY_STEPS[0],
    alwaysKeepResolution: false,
    preserveExif: false,
  });

  return blobToWebPFile(compressed, file.name);
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
 * Converte qualquer imagem suportada para WebP:
 * - sempre re-encoda (remove EXIF/GPS/ICC)
 * - preserva transparência
 * - redimensiona só se o lado maior > 1920
 * - usa ladder de qualidade para equilibrar tamanho e fidelidade visual
 */
export async function compressToWebP(file: File): Promise<File> {
  if (!isSupportedImageFile(file)) {
    throw new Error("Arquivo inválido. Selecione uma imagem JPEG, PNG ou WebP.");
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

  try {
    const bitmap = await createImageBitmap(source);
    try {
      const { width, height } = scaleDimensions(bitmap.width, bitmap.height, MAX_DIMENSION);
      return await encodeWebPWithQualityLadder(bitmap, width, height, file.name);
    } finally {
      bitmap.close();
    }
  } catch {
    return compressWithLibrary(source);
  }
}

/** Prepara qualquer imagem da câmera ou galeria para upload (sempre WebP limpo). */
export async function preparePhotoForUpload(file: File): Promise<File> {
  if (!isSupportedImageFile(file)) {
    throw new Error("Formato não suportado. Use JPEG, PNG ou WebP.");
  }
  return compressToWebP(file);
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
