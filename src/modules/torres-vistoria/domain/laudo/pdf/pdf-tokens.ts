/**
 * Tokens de design do laudo PDF — identidade Torres Vistoria.
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
  margins: [18, 30, 18, 22] as PdfMargin,
  /** 595.28 - 18 - 18 */
  contentWidth: 559,
  /** 841.89 - 30 - 22 */
  contentHeight: 790,
} as const;

/**
 * DNA visual das seções premium: coluna lateral de ícone + moldura.
 * A rail é estrutural — não um badge decorativo no título.
 */
export const PDF_SECTION = {
  railWidth: 64,
  iconSize: 34,
  iconStroke: 1.55,
  paddingX: 10,
  paddingY: 9,
  gap: 10,
} as const;

/** Identidade cromática Torres — aliases explícitos + tokens operacionais. */
export const TORRES_ORANGE = "#ea580c";
export const TORRES_DARK = "#020f2f";
export const TORRES_GRAY = "#64748b";
export const TORRES_LIGHT_GRAY = "#f1f5f9";

export const PDF_COLOR = {
  navy: TORRES_DARK,
  text: "#0f172a",
  muted: TORRES_GRAY,
  subtle: "#94a3b8",
  border: "#e2e8f0",
  borderStrong: "#cbd5e1",
  surface: "#f8fafc",
  surfaceAlt: TORRES_LIGHT_GRAY,
  attention: "#f3f5f8",
  white: "#ffffff",
  success: "#16a34a",
  successSoft: "#dcfce7",
  warning: "#d97706",
  warningSoft: "#fef3c7",
  danger: "#dc2626",
  dangerSoft: "#fee2e2",
  info: "#2563eb",
  infoSoft: "#dbeafe",
  neutral: "#64748b",
  neutralSoft: "#e2e8f0",
  orange: TORRES_ORANGE,
  orangeSoft: "#fff7ed",
  orangeDeep: "#c2410c",
  warmGray: "#78716c",
  softOrange: "#ffedd5",
  graphite: "#1c1917",
} as const;

/** Tons de rail por tipo de seção — variação controlada, identidade Torres. */
export type PdfSectionTone = "brand" | "alert" | "neutral" | "graphite" | "tech";

export function sectionToneColors(tone: PdfSectionTone, primary = TORRES_ORANGE): {
  rail: string;
  icon: string;
  soft: string;
  border: string;
} {
  switch (tone) {
    case "alert":
      return {
        rail: PDF_COLOR.warning,
        icon: PDF_COLOR.white,
        soft: PDF_COLOR.warningSoft,
        border: "#f59e0b",
      };
    case "neutral":
      return {
        rail: "#475569",
        icon: PDF_COLOR.white,
        soft: PDF_COLOR.surfaceAlt,
        border: PDF_COLOR.borderStrong,
      };
    case "graphite":
      return {
        rail: PDF_COLOR.graphite,
        icon: PDF_COLOR.white,
        soft: "#f5f5f4",
        border: "#a8a29e",
      };
    case "tech":
      return {
        rail: "#0f172a",
        icon: primary,
        soft: PDF_COLOR.surface,
        border: PDF_COLOR.borderStrong,
      };
    case "brand":
    default:
      return {
        rail: primary,
        icon: PDF_COLOR.white,
        soft: PDF_COLOR.softOrange,
        border: primary,
      };
  }
}

/** Laranja Torres — usado quando o tenant não define uma cor primária. */
export const PDF_DEFAULT_PRIMARY = TORRES_ORANGE;

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
  info: PDF_COLOR.infoSoft,
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

/** Grid de espaçamento — escala editorial. */
export const PDF_SPACE = {
  xs: 2,
  sm: 4,
  md: 6,
  lg: 8,
  xl: 12,
  xxl: 16,
  section: 14,
} as const;

/** Aliases tipográficos — escala pensada para leitura em A4. */
export const PDF_TYPE = {
  title: 18,
  section: 13,
  subtitle: 9,
  label: 7.5,
  body: 9.5,
  caption: 7,
} as const;

/**
 * Escala tipográfica. Família Source Sans 3 (ver `pdf-fonts.ts`).
 * Hierarquia por tamanho, peso e cor — tracking amplo só em rótulos em caixa alta.
 */
export const PDF_FONT = {
  display: PDF_TYPE.title,
  h1: PDF_TYPE.section,
  h2: 10.5,
  h3: 9.5,
  body: PDF_TYPE.body,
  bodyLarge: 10.5,
  small: 8.5,
  micro: PDF_TYPE.caption,
  label: PDF_TYPE.label,
  kpi: 15,
  result: 15,
  subtitle: PDF_TYPE.subtitle,
} as const;

export const PDF_TRACKING = {
  tight: 0.1,
  normal: 0.2,
  wide: 0.55,
  wider: 0.9,
} as const;

export const PDF_LINE_HEIGHT = {
  tight: 1.15,
  normal: 1.3,
  relaxed: 1.4,
} as const;

export const PDF_RADIUS = {
  sm: 2,
  md: 3,
  lg: 4,
} as const;

/** Espessuras de traço — hairlines para não poluir a impressão. */
export const PDF_STROKE = {
  hairline: 0.5,
  thin: 0.75,
  medium: 1,
  accent: 1.5,
} as const;

export const PDF_BORDER = {
  light: PDF_COLOR.border,
  medium: PDF_COLOR.borderStrong,
  accent: TORRES_ORANGE,
} as const;

/** Ritmo da grade fotográfica — gap igual na horizontal e na vertical. */
export const PDF_PHOTO = {
  gap: 6,
  captionGap: 2,
  rowGap: 8,
  groupGap: 10,
  /** Foto única: evidência em destaque, sem ocupar meia página. */
  singleWidthRatio: 0.52,
  singleMaxHeight: 176,
  /** Grade 3 cols: mais baixa para caber ~2 linhas por página. */
  gridMaxHeight: 128,
} as const;

/** Métricas da capa — logo compacto para o documento liderar, não a marca. */
export const PDF_COVER = {
  logoWidth: 78,
  logoHeight: 28,
  /** Alinhado à largura da placa (~108pt) — preenche o espaço já reservado à direita. */
  qrSize: 88,
} as const;

export const PDF_AUTHENTICITY = {
  qrSize: 68,
} as const;

/** Ícones de seção — tamanho uniforme da família outline. */
export const PDF_ICON = {
  size: 18,
  stroke: 1.35,
  badgeSize: 28,
  /** Ícone na rail lateral — visualmente dominante. */
  rail: PDF_SECTION.iconSize,
  railStroke: PDF_SECTION.iconStroke,
} as const;
