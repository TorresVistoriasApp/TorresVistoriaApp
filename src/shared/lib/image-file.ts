const HEIC_EXTENSIONS = new Set(["heic", "heif", "heics", "heifs"]);
const SUPPORTED_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "gif", "bmp", "heic", "heif"];

export const PREVIEW_MAX_SIDE = 320;

export function isHeicFile(file: File): boolean {
  const type = file.type.toLowerCase();
  if (type.includes("heic") || type.includes("heif")) return true;
  const ext = file.name.split(".").pop()?.toLowerCase();
  return ext ? HEIC_EXTENSIONS.has(ext) : false;
}

export function isSupportedImageFile(file: File): boolean {
  if (file.type.startsWith("image/")) return true;
  const ext = file.name.split(".").pop()?.toLowerCase();
  return ext ? SUPPORTED_EXTENSIONS.includes(ext) : false;
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

/** Preview leve para UI otimista — downscale no decode, sem bloquear o upload. */
export async function createPreviewObjectUrl(file: File): Promise<string> {
  try {
    const bitmap = await createImageBitmap(file, {
      resizeWidth: PREVIEW_MAX_SIDE,
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
