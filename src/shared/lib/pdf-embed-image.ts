export type PdfEmbedImageOptions = {
  maxWidth?: number;
  maxHeight?: number;
  /** Quando true, exporta PNG sem fundo (preserva alpha). Senão, JPEG opaco. */
  preferAlpha?: boolean;
  /** Qualidade JPEG (0–1). Ignorado para PNG. */
  jpegQuality?: number;
  /** MIME sugerido quando o blob vem sem Content-Type (ex.: download do Storage). */
  mimeHint?: string;
  /** Cache do fetch. Assets locais usam no-cache para pegar arquivo novo no disco. */
  cache?: RequestCache;
};

type Size = { width: number; height: number };

const SVG_MIME = "image/svg+xml";
const EMPTY_DATA_URL = "data:,";

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

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  if (preferAlpha) {
    ctx.clearRect(0, 0, size.width, size.height);
  } else {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size.width, size.height);
  }
  paint(ctx, size);

  const dataUrl = preferAlpha
    ? canvas.toDataURL("image/png")
    : canvas.toDataURL("image/jpeg", jpegQuality);

  if (!dataUrl || dataUrl === EMPTY_DATA_URL || dataUrl.length < 32) return undefined;
  return dataUrl;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      if (image.naturalWidth < 1 || image.naturalHeight < 1) {
        reject(new Error("Imagem sem dimensões"));
        return;
      }
      resolve(image);
    };
    image.onerror = () => reject(new Error("Falha ao carregar imagem"));
    image.src = src;
  });
}

/** Magic bytes — ajuda a tipar blobs octet-stream; não bloqueia decode se falhar. */
export function sniffImageMime(bytes: Uint8Array): string | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return "image/png";
  }
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "image/webp";
  }
  if (bytes.length >= 5) {
    const head = String.fromCharCode(bytes[0]!, bytes[1]!, bytes[2]!, bytes[3]!, bytes[4]!);
    if (head.startsWith("<svg") || head.startsWith("<?xml")) return SVG_MIME;
  }
  return null;
}

/** Garante MIME de imagem — Storage às vezes devolve application/octet-stream. */
export function ensureImageBlob(blob: Blob, mimeHint?: string): Blob {
  const type = blob.type?.toLowerCase() ?? "";
  if (type.startsWith("image/")) return blob;
  const hint = mimeHint?.toLowerCase();
  if (hint?.startsWith("image/")) return new Blob([blob], { type: hint });
  return new Blob([blob], { type: "image/webp" });
}

function readSvgSize(svg: Element): Size | null {
  const viewBox = svg
    .getAttribute("viewBox")
    ?.split(/[\s,]+/)
    .map(Number);
  if (viewBox?.length === 4 && viewBox[2]! > 0 && viewBox[3]! > 0) {
    return { width: viewBox[2]!, height: viewBox[3]! };
  }

  const width = Number.parseFloat(svg.getAttribute("width") ?? "");
  const height = Number.parseFloat(svg.getAttribute("height") ?? "");
  if (width > 0 && height > 0) return { width, height };

  return null;
}

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

async function rasterToDataUrl(
  blob: Blob,
  maxWidth: number,
  maxHeight: number,
  preferAlpha: boolean,
  jpegQuality: number,
): Promise<string | undefined> {
  // 1) ImageBitmap (rápido quando funciona)
  try {
    const bitmap = await createImageBitmap(blob);
    try {
      if (!bitmap.width || !bitmap.height) return undefined;
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
    // segue para HTMLImageElement
  }

  // 2) Mesmo decoder da galeria (<img>)
  const objectUrl = URL.createObjectURL(blob);
  try {
    const image = await loadImage(objectUrl);
    const size = fitWithin(image.naturalWidth, image.naturalHeight, maxWidth, maxHeight);
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
 * Converte Blob → data URL JPEG/PNG para pdfmake.
 * pdfmake não embute WebP: re-encode via canvas.
 */
export async function blobToPdfDataUrl(
  source: Blob,
  options: PdfEmbedImageOptions = {},
): Promise<string | undefined> {
  const {
    maxWidth = 1200,
    maxHeight = 1200,
    preferAlpha = false,
    jpegQuality = 0.8,
    mimeHint,
  } = options;

  try {
    const buffer = await source.arrayBuffer();
    if (buffer.byteLength < 8) return undefined;

    const bytes = new Uint8Array(buffer);
    const sniffed = sniffImageMime(bytes);
    const type =
      sniffed ??
      (source.type?.startsWith("image/") ? source.type : null) ??
      (mimeHint?.startsWith("image/") ? mimeHint : null) ??
      "image/webp";

    // Resposta HTML/JSON de erro (não é imagem)
    if (!sniffed && source.type && !source.type.startsWith("image/")) {
      const head = new TextDecoder().decode(bytes.slice(0, 64)).trim().toLowerCase();
      if (head.startsWith("<!doctype") || head.startsWith("<html") || head.startsWith("{")) {
        return undefined;
      }
    }

    const typed = new Blob([buffer], { type });

    if (type.startsWith(SVG_MIME)) {
      return await svgToDataUrl(
        new TextDecoder().decode(bytes),
        maxWidth,
        maxHeight,
        preferAlpha,
        jpegQuality,
      );
    }

    return await rasterToDataUrl(typed, maxWidth, maxHeight, preferAlpha, jpegQuality);
  } catch {
    return undefined;
  }
}

function isFetchableUrl(url: string): boolean {
  return (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("blob:") ||
    url.startsWith("data:") ||
    url.startsWith("/")
  );
}

/**
 * Carrega uma imagem (URL http(s), path relativo ou blob:) e gera data URL para pdfmake.
 */
const DEFAULT_FETCH_TIMEOUT_MS = 30_000;

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs = DEFAULT_FETCH_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    window.clearTimeout(timer);
  }
}

export async function imageUrlToPdfDataUrl(
  url: string,
  options: PdfEmbedImageOptions = {},
): Promise<string | undefined> {
  if (!url || !isFetchableUrl(url)) return undefined;

  try {
    const cache =
      options.cache ??
      (url.startsWith("/") || url.startsWith("data:") ? "no-cache" : "no-store");
    const response = await fetchWithTimeout(url, { cache });
    if (!response.ok) return undefined;
    const blob = await response.blob();
    return await blobToPdfDataUrl(blob, options);
  } catch {
    return undefined;
  }
}

/** Executa async map com limite de paralelismo — evita OOM ao embutir dezenas de fotos. */
export async function mapWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  mapper: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  if (items.length === 0) return [];
  const limit = Math.max(1, Math.min(concurrency, items.length));
  const results = new Array<R>(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const index = nextIndex++;
      results[index] = await mapper(items[index]!, index);
      // Cede a UI entre itens — evita spinner congelado ao embutir dezenas de fotos.
      await new Promise<void>((resolve) => {
        globalThis.setTimeout(resolve, 0);
      });
    }
  }

  await Promise.all(Array.from({ length: limit }, () => worker()));
  return results;
}
