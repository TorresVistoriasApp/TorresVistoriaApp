import imageCompression from "browser-image-compression";

const STORAGE_BUCKET = "inspection-photos";

const MAX_DIMENSION = 1920;
const MAX_OUTPUT_MB = 2;
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

function scaleDimensions(width: number, height: number, maxSide: number) {
  if (width <= maxSide && height <= maxSide) {
    return { width, height };
  }
  const ratio = Math.min(maxSide / width, maxSide / height);
  return {
    width: Math.round(width * ratio),
    height: Math.round(height * ratio),
  };
}

async function loadImageElement(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () =>
        reject(
          new Error(
            isHeicFile(file)
              ? "Formato HEIC não suportado neste navegador. Use a câmera do app ou salve a foto como JPEG na galeria."
              : "Não foi possível abrir a imagem selecionada.",
          ),
        );
      image.src = url;
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

async function canvasToWebP(image: HTMLImageElement, quality = 0.82): Promise<File> {
  const { width, height } = scaleDimensions(image.naturalWidth, image.naturalHeight, MAX_DIMENSION);
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Não foi possível processar a imagem.");

  ctx.drawImage(image, 0, 0, width, height);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (result) => (result ? resolve(result) : reject(new Error("Falha ao converter imagem."))),
      "image/webp",
      quality,
    );
  });

  return new File([blob], `photo-${Date.now()}.webp`, { type: "image/webp" });
}

export async function compressToWebP(file: File): Promise<File> {
  if (!isSupportedImageFile(file)) {
    throw new Error("Arquivo inválido. Selecione uma imagem JPEG, PNG ou WebP.");
  }

  try {
    return await imageCompression(file, {
      maxWidthOrHeight: MAX_DIMENSION,
      maxSizeMB: MAX_OUTPUT_MB,
      useWebWorker: file.size > WEB_WORKER_THRESHOLD_BYTES,
      fileType: "image/webp",
      initialQuality: 0.82,
      alwaysKeepResolution: false,
    });
  } catch {
    const image = await loadImageElement(file);
    return canvasToWebP(image);
  }
}

/** Prepara qualquer imagem da câmera ou galeria para upload. */
export async function preparePhotoForUpload(file: File): Promise<File> {
  if (!isSupportedImageFile(file)) {
    throw new Error("Formato não suportado. Use JPEG, PNG ou WebP.");
  }

  if (file.type === "image/webp" && file.size <= MAX_OUTPUT_MB * 1024 * 1024) {
    return file;
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

export { STORAGE_BUCKET };
