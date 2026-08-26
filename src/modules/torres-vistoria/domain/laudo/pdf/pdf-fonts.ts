/**
 * Tipografia do laudo PDF — Source Sans 3 (Adobe / OFL).
 * Família formal, neutra e legível em tabelas e texto corrido.
 * Se o carregamento falhar, o doc usa Roboto (vfs padrão do pdfmake).
 */

export const PDF_FONT_FAMILY = "SourceSans3";
export const PDF_FONT_FALLBACK = "Roboto";

/** Source Sans exige ~1,5 MB de TTF no vfs — desligado até estabilizar geração com 60+ fotos. */
const ENABLE_SOURCE_SANS = false;

const FONT_FETCH_TIMEOUT_MS = 15_000;

const FONT_ASSETS = {
  normal: {
    file: "SourceSans3-Regular.ttf",
    url: "/fonts/laudo/SourceSans3-Regular.ttf",
  },
  bold: {
    file: "SourceSans3-Bold.ttf",
    url: "/fonts/laudo/SourceSans3-Bold.ttf",
  },
  italics: {
    file: "SourceSans3-It.ttf",
    url: "/fonts/laudo/SourceSans3-It.ttf",
  },
  bolditalics: {
    file: "SourceSans3-BoldIt.ttf",
    url: "/fonts/laudo/SourceSans3-BoldIt.ttf",
  },
} as const;

type PdfMakeEngine = {
  vfs?: Record<string, string>;
  fonts?: Record<
    string,
    { normal: string; bold: string; italics: string; bolditalics: string }
  >;
};

let fontsReady: Promise<boolean> | null = null;

/** Evita spread gigante (String.fromCharCode(...32k args) trava/estoura a stack). */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x2000;
  let binary = "";
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const end = Math.min(i + chunkSize, bytes.length);
    for (let j = i; j < end; j++) {
      binary += String.fromCharCode(bytes[j]!);
    }
  }
  return btoa(binary);
}

async function fetchFontBase64(url: string): Promise<string> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), FONT_FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, { cache: "force-cache", signal: controller.signal });
    if (!response.ok) {
      throw new Error(`Falha ao carregar fonte do laudo: ${url}`);
    }
    return arrayBufferToBase64(await response.arrayBuffer());
  } finally {
    window.clearTimeout(timer);
  }
}

/**
 * Garante Source Sans 3 no vfs/fonts do pdfmake (browser).
 * @returns true se SourceSans3 ficou disponível.
 */
export async function ensureLaudoPdfFonts(pdfDoc: PdfMakeEngine): Promise<boolean> {
  if (!ENABLE_SOURCE_SANS) return false;

  if (!fontsReady) {
    fontsReady = (async () => {
      const vfs = { ...(pdfDoc.vfs ?? {}) };
      await Promise.all(
        Object.values(FONT_ASSETS).map(async (asset) => {
          if (vfs[asset.file]) return;
          vfs[asset.file] = await fetchFontBase64(asset.url);
        }),
      );
      pdfDoc.vfs = vfs;
      pdfDoc.fonts = {
        ...(pdfDoc.fonts ?? {}),
        [PDF_FONT_FAMILY]: {
          normal: FONT_ASSETS.normal.file,
          bold: FONT_ASSETS.bold.file,
          italics: FONT_ASSETS.italics.file,
          bolditalics: FONT_ASSETS.bolditalics.file,
        },
      };
      return true;
    })().catch(() => {
      fontsReady = null;
      return false;
    });
  }
  return fontsReady;
}

export function resolveLaudoPdfFont(sourceSansReady: boolean): string {
  return sourceSansReady ? PDF_FONT_FAMILY : PDF_FONT_FALLBACK;
}
