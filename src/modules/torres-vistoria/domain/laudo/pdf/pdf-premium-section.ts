/**
 * PdfPremiumSection — linguagem editorial da referência (versão Torres).
 *
 * Padrão visual:
 *
 *   [ÍCONE GRANDE]  Título                    [status?]
 *                   Subtítulo
 *
 *   ┌────────────────────────────────────────────────┐
 *   │ ■■■ barra colorida + ícone pequeno + RÓTULO ■■■│
 *   ├────────────────────────────────────────────────┤
 *   │ conteúdo                                       │
 *   └────────────────────────────────────────────────┘
 *
 * NÃO é coluna vertical laranja ao longo do conteúdo.
 */
import {
  PDF_COLOR,
  PDF_FONT,
  PDF_LINE_HEIGHT,
  PDF_PAGE,
  PDF_SECTION,
  PDF_SPACE,
  PDF_TRACKING,
  toneSoftColor,
  type PdfMargin,
  type PdfNode,
  type PdfTone,
} from "@/modules/torres-vistoria/domain/laudo/pdf/pdf-tokens";
import { PDF_LAYOUT } from "@/modules/torres-vistoria/domain/laudo/pdf/pdf-table-layouts";
import { pdfIcon, type PdfIconName } from "@/modules/torres-vistoria/domain/laudo/pdf/pdf-icons";
import { statusDot } from "@/modules/torres-vistoria/domain/laudo/pdf/pdf-primitives";
import type { LaudoSectionIconDataUrls } from "@/modules/torres-vistoria/domain/laudo/pdf/section-icons";

/** Ícones pictóricos do payload atual — preenchidos em `buildLaudoDocDefinition`. */
let activeSectionIcons: LaudoSectionIconDataUrls | undefined;

export function setActiveSectionIcons(icons: LaudoSectionIconDataUrls | undefined): void {
  activeSectionIcons = icons;
}

function resolveIconDataUrl(icon: PdfIconName, explicit?: string): string | undefined {
  return explicit ?? activeSectionIcons?.[icon];
}

export type PremiumStatus = {
  tone: PdfTone;
  label?: string;
};

export type PremiumSectionOptions = {
  icon: PdfIconName;
  /** Imagem pictórica do segmento (preferida sobre outline). */
  iconDataUrl?: string;
  title: string;
  subtitle?: string;
  /** Rótulo da barra colorida do card (ex.: "Detalhes", "Fotos"). */
  barLabel?: string;
  barIcon?: PdfIconName;
  accent?: string;
  status?: PremiumStatus;
  children?: PdfNode[];
  margin?: PdfMargin;
  unbreakable?: boolean;
  pageBreak?: "before";
};

const INTRO_ICON = 48;

function statusBadgeNode(status: PremiumStatus): PdfNode {
  const color =
    status.tone === "success"
      ? PDF_COLOR.success
      : status.tone === "warning"
        ? PDF_COLOR.warning
        : status.tone === "danger"
          ? PDF_COLOR.danger
          : status.tone === "info"
            ? PDF_COLOR.info
            : PDF_COLOR.neutral;

  if (!status.label) {
    return {
      width: 16,
      canvas: [
        { type: "ellipse", x: 8, y: 8, r1: 7, r2: 7, color },
        {
          type: "polyline",
          points: [
            { x: 5, y: 8 },
            { x: 7.2, y: 10.2 },
            { x: 11.5, y: 5.8 },
          ],
          lineWidth: 1.4,
          lineColor: PDF_COLOR.white,
        },
      ],
    };
  }

  return {
    table: {
      widths: ["auto"],
      body: [
        [
          {
            columns: [
              statusDot(color, 4.5),
              {
                text: status.label.toUpperCase(),
                fontSize: PDF_FONT.micro,
                bold: true,
                color,
                width: "auto",
              },
            ],
            columnGap: 3,
            fillColor: toneSoftColor(status.tone),
            margin: [5, 3, 6, 3],
          },
        ],
      ],
    },
    layout: PDF_LAYOUT.statusChip,
  };
}

/**
 * Intro da seção: imagem do segmento à esquerda + título + subtítulo.
 * Prefere asset pictórico; cai no outline só se a imagem não estiver disponível.
 */
export function premiumSectionIntro(options: {
  icon: PdfIconName;
  iconDataUrl?: string;
  title: string;
  subtitle?: string;
  accent?: string;
  status?: PremiumStatus;
  margin?: PdfMargin;
}): PdfNode {
  const accent = options.accent ?? PDF_COLOR.orange;
  const iconDataUrl = resolveIconDataUrl(options.icon, options.iconDataUrl);

  const iconNode: PdfNode = iconDataUrl
    ? {
        image: iconDataUrl,
        fit: [INTRO_ICON, INTRO_ICON],
        width: INTRO_ICON,
        alignment: "center",
      }
    : pdfIcon(options.icon, {
        size: INTRO_ICON,
        color: accent,
        stroke: 1.7,
      });

  return {
    unbreakable: true,
    margin: options.margin ?? [0, 0, 0, PDF_SPACE.md],
    columns: [
      {
        width: INTRO_ICON + 10,
        stack: [iconNode],
      },
      {
        width: "*",
        margin: [PDF_SPACE.sm, 4, 0, 0] as PdfMargin,
        stack: [
          {
            columns: [
              {
                width: "auto",
                text: options.title,
                bold: true,
                fontSize: 15,
                color: PDF_COLOR.navy,
                lineHeight: PDF_LINE_HEIGHT.tight,
              },
              ...(options.status
                ? [
                    {
                      width: 18,
                      margin: [8, 1, 0, 0] as PdfMargin,
                      stack: [statusBadgeNode(options.status)],
                    },
                  ]
                : []),
              { width: "*", text: "" },
            ],
            columnGap: 4,
          },
          ...(options.subtitle
            ? [
                {
                  text: options.subtitle,
                  fontSize: PDF_FONT.subtitle,
                  color: PDF_COLOR.muted,
                  margin: [0, 3, 0, 0] as PdfMargin,
                  lineHeight: PDF_LINE_HEIGHT.normal,
                },
              ]
            : []),
        ],
      },
    ],
    columnGap: PDF_SPACE.md,
  };
}

/** Barra horizontal colorida do card (equivalente ao vermelho da referência → laranja Torres). */
function cardHeaderBar(options: {
  label: string;
  icon: PdfIconName;
  accent: string;
  width: number;
}): PdfNode {
  const barH = 22;
  return {
    table: {
      widths: ["*"],
      heights: [barH],
      body: [
        [
          {
            fillColor: options.accent,
            margin: [10, 4, 10, 4],
            columns: [
              {
                width: 14,
                ...pdfIcon(options.icon, {
                  size: 12,
                  color: PDF_COLOR.white,
                  stroke: 1.35,
                }),
              },
              {
                width: "*",
                text: options.label.toUpperCase(),
                bold: true,
                fontSize: PDF_FONT.small,
                color: PDF_COLOR.white,
                characterSpacing: PDF_TRACKING.wide,
                margin: [4, 1, 0, 0],
              },
            ],
            columnGap: 4,
          },
        ],
      ],
    },
    layout: PDF_LAYOUT.none,
  };
}

/**
 * Card com barra colorida no topo + conteúdo.
 * É a "moldura" da referência — não um rail vertical.
 */
export function premiumCard(options: {
  barLabel: string;
  barIcon?: PdfIconName;
  accent?: string;
  children: PdfNode[];
  margin?: PdfMargin;
  contentWidth?: number;
}): PdfNode {
  const accent = options.accent ?? PDF_COLOR.orange;
  const width = options.contentWidth ?? PDF_PAGE.contentWidth;

  return {
    margin: options.margin ?? [0, 0, 0, 0],
    table: {
      widths: [width],
      body: [
        [
          {
            stack: [
              cardHeaderBar({
                label: options.barLabel,
                icon: options.barIcon ?? "document",
                accent,
                width,
              }),
              {
                fillColor: PDF_COLOR.white,
                margin: [PDF_SECTION.paddingX, PDF_SECTION.paddingY, PDF_SECTION.paddingX, PDF_SECTION.paddingY],
                stack: options.children,
              },
            ],
          },
        ],
      ],
    },
    layout: PDF_LAYOUT.premiumSection,
  };
}

/**
 * Seção completa = intro + card.
 * API única usada por todas as seções do laudo.
 */
export function premiumSection(options: PremiumSectionOptions): PdfNode {
  const accent = options.accent ?? PDF_COLOR.orange;
  const barLabel = options.barLabel ?? options.title;
  const children = options.children ?? [];

  return {
    ...(options.pageBreak ? { pageBreak: options.pageBreak } : {}),
    ...(options.unbreakable ? { unbreakable: true } : {}),
    margin: options.margin ?? [0, PDF_SECTION.gap + 2, 0, 0],
    stack: [
      premiumSectionIntro({
        icon: options.icon,
        iconDataUrl: options.iconDataUrl,
        title: options.title,
        subtitle: options.subtitle,
        accent,
        status: options.status,
      }),
      premiumCard({
        barLabel,
        barIcon: options.barIcon ?? options.icon,
        accent,
        children,
      }),
    ],
  };
}

/** Só o intro — para seções cujo corpo flui em múltiplos cards/páginas. */
export function premiumSectionLead(
  options: Omit<PremiumSectionOptions, "children">,
): PdfNode {
  return {
    unbreakable: true,
    margin: options.margin ?? [0, PDF_SECTION.gap + 2, 0, 0],
    stack: [
      premiumSectionIntro({
        icon: options.icon,
        iconDataUrl: options.iconDataUrl,
        title: options.title,
        subtitle: options.subtitle,
        accent: options.accent,
        status: options.status,
      }),
    ],
  };
}

/**
 * Corpo em card com barra — usado após premiumSectionLead
 * (checklist categorias, grupos de fotos, etc.).
 */
export function premiumSectionBody(
  children: PdfNode[],
  options: {
    accent?: string;
    barLabel?: string;
    barIcon?: PdfIconName;
    margin?: PdfMargin;
  } = {},
): PdfNode {
  if (children.length === 0) return { text: "" };
  return premiumCard({
    barLabel: options.barLabel ?? "Detalhes",
    barIcon: options.barIcon ?? "document",
    accent: options.accent,
    children,
    margin: options.margin ?? [0, 0, 0, 0],
  });
}

/** Largura útil do conteúdo dentro do card (com padding). */
export function premiumContentWidth(pageWidth = PDF_PAGE.contentWidth): number {
  return pageWidth - PDF_SECTION.paddingX * 2;
}

/** Chip de destaque (placa, renavam…) — caixinhas da referência. */
export function premiumMetaChip(options: {
  label: string;
  value: string;
  icon?: PdfIconName;
  accent?: string;
}): PdfNode {
  const accent = options.accent ?? PDF_COLOR.orange;
  return {
    fillColor: PDF_COLOR.surfaceAlt,
    margin: [0, 0, 0, 0],
    stack: [
      {
        columns: [
          ...(options.icon
            ? [
                {
                  width: 11,
                  ...pdfIcon(options.icon, { size: 10, color: accent, stroke: 1.2 }),
                },
              ]
            : []),
          {
            width: "*",
            text: options.label.toUpperCase(),
            fontSize: 5.8,
            bold: true,
            color: accent,
            characterSpacing: PDF_TRACKING.normal,
          },
        ],
        columnGap: 3,
        margin: [6, 5, 6, 0],
      },
      {
        text: options.value,
        bold: true,
        fontSize: PDF_FONT.small,
        color: PDF_COLOR.navy,
        margin: [6, 2, 6, 5],
      },
    ],
  };
}

/** Grade 2 colunas label | valor com filetes — estilo referência. */
export function premiumKvGrid(
  rows: [string, string][],
  options: { columns?: number; margin?: PdfMargin } = {},
): PdfNode | null {
  if (rows.length === 0) return null;
  const columns = options.columns ?? 2;
  const body: PdfNode[][] = [];

  for (let i = 0; i < rows.length; i += columns) {
    const slice = rows.slice(i, i + columns);
    body.push([
      ...slice.map(([label, value]) => ({
        columns: [
          {
            width: "42%",
            text: label,
            bold: true,
            fontSize: PDF_FONT.small,
            color: PDF_COLOR.navy,
          },
          {
            width: "*",
            text: value,
            fontSize: PDF_FONT.small,
            color: PDF_COLOR.text,
            alignment: "right" as const,
          },
        ],
        columnGap: 4,
        margin: [0, 3, 0, 3],
      })),
      ...Array.from({ length: columns - slice.length }, () => ({ text: "" })),
    ]);
  }

  return {
    margin: options.margin ?? [0, 0, 0, 0],
    table: {
      widths: Array.from({ length: columns }, () => "*"),
      body,
    },
    layout: PDF_LAYOUT.fieldsDivided,
  };
}
