/**
 * Tokens de design do laudo PDF.
 *
 * Único lugar onde valores hexadecimais, tamanhos de fonte e métricas de página
 * do laudo são declarados. Camadas de layout e componentes consomem estes
 * tokens; nenhum literal de cor deve ser espalhado pelos builders.
 */

export type PdfNode = Record<string, unknown>;
export type PdfMargin = [number, number, number, number];

/** A4 retrato: 595.28 x 841.89pt. */
export const PDF_PAGE = {
  size: "A4",
  margins: [24, 34, 24, 28] as PdfMargin,
  /** 595.28 - 24 - 24, arredondado para baixo. */
  contentWidth: 547,
  /** 841.89 - 34 - 28, arredondado para baixo. */
  contentHeight: 780,
} as const;

export const PDF_COLOR = {
  /** Azul institucional Torres — títulos, barras de seção e texto forte. */
  navy: "#020f2f",
  text: "#0f172a",
  muted: "#64748b",
  subtle: "#94a3b8",
  border: "#e2e8f0",
  borderStrong: "#cbd5e1",
  surface: "#f8fafc",
  surfaceAlt: "#f1f5f9",
  white: "#ffffff",
  success: "#16a34a",
  successSoft: "#dcfce7",
  warning: "#d97706",
  warningSoft: "#fef3c7",
  danger: "#dc2626",
  dangerSoft: "#fee2e2",
  info: "#2563eb",
  neutral: "#64748b",
  neutralSoft: "#e2e8f0",
} as const;

/** Laranja Torres — usado quando o tenant não define uma cor primária. */
export const PDF_DEFAULT_PRIMARY = "#ea580c";

export type PdfTone = "success" | "warning" | "danger" | "info" | "neutral";

const TONE_COLOR: Record<PdfTone, string> = {
  success: PDF_COLOR.success,
  warning: PDF_COLOR.warning,
  danger: PDF_COLOR.danger,
  info: PDF_COLOR.info,
  neutral: PDF_COLOR.neutral,
};

const TONE_SOFT_COLOR: Record<PdfTone, string> = {
  success: PDF_COLOR.successSoft,
  warning: PDF_COLOR.warningSoft,
  danger: PDF_COLOR.dangerSoft,
  info: PDF_COLOR.surfaceAlt,
  neutral: PDF_COLOR.neutralSoft,
};

export function toneColor(tone: PdfTone): string {
  return TONE_COLOR[tone];
}

export function toneSoftColor(tone: PdfTone): string {
  return TONE_SOFT_COLOR[tone];
}

/**
 * Paleta de apoio para séries por categoria. Tons dessaturados e de
 * luminosidade parecida, para nenhuma categoria parecer mais grave que outra.
 */
export const PDF_CATEGORY_PALETTE = [
  "#1d4ed8",
  "#0f766e",
  "#b45309",
  "#7c3aed",
  "#be123c",
  "#0369a1",
  "#4d7c0f",
  "#a16207",
  "#9333ea",
  "#475569",
] as const;

export function categoryPaletteColor(index: number): string {
  return PDF_CATEGORY_PALETTE[index % PDF_CATEGORY_PALETTE.length];
}

/** Grid de espaçamento — escala enxuta. Valores grandes são exceção. */
export const PDF_SPACE = {
  xs: 2,
  sm: 4,
  md: 6,
  lg: 8,
  xl: 12,
  xxl: 16,
} as const;

/**
 * Escala tipográfica. Uma única família (Roboto, embutida no pdfmake) em
 * regular e bold; a hierarquia vem de tamanho, cor e espaçamento entre letras.
 */
export const PDF_FONT = {
  display: 16,
  h1: 11,
  h2: 9.5,
  h3: 8.5,
  body: 8,
  bodyLarge: 9,
  small: 7.5,
  micro: 6.5,
  kpi: 13,
  result: 14,
} as const;

export const PDF_TRACKING = {
  tight: 0.2,
  normal: 0.4,
  wide: 0.8,
  wider: 1.4,
} as const;

export const PDF_LINE_HEIGHT = {
  tight: 1.08,
  normal: 1.18,
  relaxed: 1.28,
} as const;

export const PDF_RADIUS = {
  sm: 2,
  md: 3,
  lg: 5,
} as const;

/** Espessuras de traço — hairlines para não poluir a impressão. */
export const PDF_STROKE = {
  hairline: 0.5,
  thin: 0.75,
  medium: 1,
} as const;

/** Ritmo da grade fotográfica — gap igual na horizontal e na vertical. */
export const PDF_PHOTO = {
  gap: 8,
  captionGap: 3,
  rowGap: 8,
  groupGap: 10,
  /** Foto única: evidência em destaque, sem ocupar a página inteira. */
  singleWidthRatio: 0.72,
} as const;

/** Métricas da capa — logo compacto para o documento liderar, não a marca. */
export const PDF_COVER = {
  logoWidth: 78,
  logoHeight: 28,
  qrSize: 42,
} as const;

export const PDF_AUTHENTICITY = {
  qrSize: 64,
} as const;
