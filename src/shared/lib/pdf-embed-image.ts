export type PdfEmbedImageOptions = {
  maxWidth?: number;
  maxHeight?: number;
  /** Quando true, exporta PNG sem fundo (preserva alpha). Senão, JPEG opaco. */
  preferAlpha?: boolean;
  /** Qualidade JPEG (0–1). Ignorado para PNG. */
  jpegQuality?: number;
};

type Size = { width: number; height: number };

const SVG_MIME = "image/svg+xml";

function fitWithin(
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number,
  allowUpscale = false,
): Size {
  const scale = Math.min(maxWidth / width, maxHeight / height, allowUpscale ? Infinity : 1);
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

function encodeCanvas(
  size: Size,
  paint: (ctx: CanvasRenderingContext2D, size: Size) => void,
  preferAlpha: boolean,
  jpegQuality: number,
): string | undefined {
  const canvas = document.createElement("canvas");
  canvas.width = size.width;
  canvas.height = size.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return undefined;

  if (preferAlpha) {
    ctx.clearRect(0, 0, size.width, size.height);
  } else {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size.width, size.height);
  }
  paint(ctx, size);

  return preferAlpha ? canvas.toDataURL("image/png") : canvas.toDataURL("image/jpeg", jpegQuality);
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Falha ao carregar imagem"));
    image.src = src;
  });
}

function readSvgSize(svg: Element): Size | null {
  const viewBox = svg
    .getAttribute("viewBox")
    ?.split(/[\s,]+/)
    .map(Number);
  if (viewBox?.length === 4 && viewBox[2] > 0 && viewBox[3] > 0) {
    return { width: viewBox[2], height: viewBox[3] };
  }

  const width = Number.parseFloat(svg.getAttribute("width") ?? "");
  const height = Number.parseFloat(svg.getAttribute("height") ?? "");
  if (width > 0 && height > 0) return { width, height };

  return null;
}

/**
 * Vetores não têm resolução nativa: rasterizamos direto no tamanho pedido, sem o teto
 * de 1x usado para bitmaps. As dimensões são gravadas no próprio SVG antes de virar
 * imagem para que todos os engines rasterizem na resolução final em vez de ampliar.
 */
async function svgToDataUrl(
  markup: string,
  maxWidth: number,
  maxHeight: number,
  preferAlpha: boolean,
  jpegQuality: number,
): Promise<string | undefined> {
  const svg = new DOMParser().parseFromString(markup, SVG_MIME).documentElement;
  if (svg.tagName.toLowerCase() !== "svg" || svg.querySelector("parsererror")) return undefined;

  const intrinsic = readSvgSize(svg);
  if (!intrinsic) return undefined;

  if (!svg.getAttribute("viewBox")) {
    svg.setAttribute("viewBox", `0 0 ${intrinsic.width} ${intrinsic.height}`);
  }
  const size = fitWithin(intrinsic.width, intrinsic.height, maxWidth, maxHeight, true);
  svg.setAttribute("width", String(size.width));
  svg.setAttribute("height", String(size.height));

  const objectUrl = URL.createObjectURL(
    new Blob([new XMLSerializer().serializeToString(svg)], { type: SVG_MIME }),
  );
  try {
    const image = await loadImage(objectUrl);
    return encodeCanvas(
      size,
      (ctx, { width, height }) => ctx.drawImage(image, 0, 0, width, height),
      preferAlpha,
      jpegQuality,
    );
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

/**
 * Carrega uma imagem e gera data URL otimizada para pdfmake.
 * pdfmake não embute WebP nem SVG de forma confiável: usa PNG (alpha) ou JPEG (fotos).
 * Bitmaps são redimensionados só quando ultrapassam o teto; remove metadados via re-encode.
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

    if (blob.type.startsWith(SVG_MIME)) {
      return await svgToDataUrl(await blob.text(), maxWidth, maxHeight, preferAlpha, jpegQuality);
    }

    const bitmap = await createImageBitmap(blob);
    try {
      const size = fitWithin(bitmap.width, bitmap.height, maxWidth, maxHeight);
      return encodeCanvas(
        size,
        (ctx, { width, height }) => ctx.drawImage(bitmap, 0, 0, width, height),
        preferAlpha,
        jpegQuality,
      );
    } finally {
      bitmap.close();
    }
  } catch {
    return undefined;
  }
}
