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
  /** @deprecated Ícone da barra removido — a intro já carrega a imagem do segmento. */
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
export function cardHeaderBar(options: {
  label: string;
  accent: string;
  width: number;
}): PdfNode {
  const barH = 22;
  return {
    unbreakable: true,
    table: {
      widths: ["*"],
      heights: [barH],
      body: [
        [
          {
            fillColor: options.accent,
            margin: [10, 5, 10, 5],
            columns: [
              {
                width: "*",
                text: options.label.toUpperCase(),
                bold: true,
                fontSize: PDF_FONT.small,
                color: PDF_COLOR.white,
                characterSpacing: PDF_TRACKING.wide,
              },
            ],
          },
        ],
      ],
    },
    layout: PDF_LAYOUT.none,
  };
}

/** Corpo branco do card — pode paginar; a barra colorida fica sempre acima, intacta. */
function premiumCardContent(options: {
  children: PdfNode[];
  width?: number;
}): PdfNode {
  const width = options.width ?? PDF_PAGE.contentWidth;
  return {
    table: {
      widths: [width],
      body: [
        [
          {
            fillColor: PDF_COLOR.white,
            margin: [PDF_SECTION.paddingX, PDF_SECTION.paddingY, PDF_SECTION.paddingX, PDF_SECTION.paddingY],
            stack: options.children,
          },
        ],
      ],
    },
    layout: PDF_LAYOUT.premiumSection,
  };
}

/**
 * Card com barra colorida no topo + conteúdo.
 * É a "moldura" da referência — não um rail vertical.
 */
export function premiumCard(options: {
  barLabel: string;
  accent?: string;
  children: PdfNode[];
  margin?: PdfMargin;
  contentWidth?: number;
}): PdfNode {
  const accent = options.accent ?? PDF_COLOR.orange;
  const width = options.contentWidth ?? PDF_PAGE.contentWidth;

  return {
    margin: options.margin ?? [0, 0, 0, 0],
    stack: [
      cardHeaderBar({
        label: options.barLabel,
        accent,
        width,
      }),
      premiumCardContent({
        children: options.children,
        width,
      }),
    ],
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
  const width = PDF_PAGE.contentWidth;

  const introBlock = premiumSectionIntro({
    icon: options.icon,
    iconDataUrl: options.iconDataUrl,
    title: options.title,
    subtitle: options.subtitle,
    accent,
    status: options.status,
  });

  const headerBar = cardHeaderBar({
    label: barLabel,
    accent,
    width,
  });

  const contentBlock = premiumCardContent({ children, width });

  /** Intro + barra colorida nunca se separam — evita faixa cortada entre páginas. */
  const sectionHead = {
    unbreakable: true,
    stack: [introBlock, headerBar],
  };

  const body = options.unbreakable
    ? {
        unbreakable: true,
        stack: [sectionHead, contentBlock],
      }
    : {
        stack: [sectionHead, contentBlock],
      };

  return {
    ...(options.pageBreak ? { pageBreak: options.pageBreak } : {}),
    margin: options.margin ?? [0, PDF_SECTION.gap + 2, 0, 0],
    ...body,
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
    /** Ignorado — barra só com texto (ícone fica na intro). */
    barIcon?: PdfIconName;
    margin?: PdfMargin;
  } = {},
): PdfNode {
  if (children.length === 0) return { text: "" };
  return premiumCard({
    barLabel: options.barLabel ?? "Detalhes",
    accent: options.accent,
    children,
    margin: options.margin ?? [0, 0, 0, 0],
  });
}

/** Largura útil do conteúdo dentro do card (com padding). */
export function premiumContentWidth(pageWidth = PDF_PAGE.contentWidth): number {
  return pageWidth - PDF_SECTION.paddingX * 2;
}

/** Chip de destaque (placa, renavam…) — só tipografia; sem ícone outline minúsculo. */
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
        text: options.label.toUpperCase(),
        fontSize: PDF_FONT.micro,
        bold: true,
        color: accent,
        characterSpacing: PDF_TRACKING.wide,
        margin: [7, 5, 7, 0],
      },
      {
        text: options.value,
        bold: true,
        fontSize: PDF_FONT.small,
        color: PDF_COLOR.navy,
        margin: [7, 2, 7, 5],
      },
    ],
  };
}

/**
 * Grade 2 colunas — rótulo + valor lado a lado (valor à esquerda, junto do rótulo).
 */
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
            width: "auto",
            text: label,
            bold: true,
            fontSize: PDF_FONT.small,
            color: PDF_COLOR.navy,
          },
          {
            width: "*",
            text: value,
            bold: false,
            fontSize: PDF_FONT.small,
            color: PDF_COLOR.text,
            alignment: "left" as const,
          },
        ],
        columnGap: 6,
        margin: [0, 3.5, 0, 3.5],
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
