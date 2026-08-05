export type PdfEmbedImageOptions = {
  maxWidth?: number;
  maxHeight?: number;
  /** Quando true, exporta PNG sem fundo (preserva alpha). Senão, JPEG opaco. */
  preferAlpha?: boolean;
  /** Qualidade JPEG (0–1). Ignorado para PNG. */
  jpegQuality?: number;
};

function fitWithin(
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number,
): { width: number; height: number } {
  const scale = Math.min(maxWidth / width, maxHeight / height, 1);
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

/**
 * Carrega uma imagem e gera data URL otimizada para pdfmake.
 * pdfmake não embute WebP de forma confiável: usa PNG (alpha) ou JPEG (fotos).
 * Redimensiona só quando ultrapassa o teto; remove metadados via re-encode.
 */
export async function imageUrlToPdfDataUrl(
  url: string,
  options: PdfEmbedImageOptions = {},
): Promise<string | undefined> {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    preferAlpha = false,
    jpegQuality = 0.8,
  } = options;

  try {
    const response = await fetch(url);
    if (!response.ok) return undefined;
    const blob = await response.blob();
    const bitmap = await createImageBitmap(blob);
    try {
      const { width, height } = fitWithin(bitmap.width, bitmap.height, maxWidth, maxHeight);
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return undefined;

      if (preferAlpha) {
        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(bitmap, 0, 0, width, height);
        return canvas.toDataURL("image/png");
      }

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(bitmap, 0, 0, width, height);
      return canvas.toDataURL("image/jpeg", jpegQuality);
    } finally {
      bitmap.close();
    }
  } catch {
    return undefined;
  }
}
