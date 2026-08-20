/**
 * Componentes visuais reutilizáveis do laudo PDF.
 *
 * Camada puramente de apresentação: recebe texto e cores já resolvidos e
 * devolve nós pdfmake. Nenhuma regra de negócio mora aqui.
 */
import {
  PDF_COLOR,
  PDF_FONT,
  PDF_LINE_HEIGHT,
  PDF_PAGE,
  PDF_RADIUS,
  PDF_SPACE,
  PDF_STROKE,
  PDF_TRACKING,
  type PdfMargin,
  type PdfNode,
} from "@/modules/torres-vistoria/domain/laudo/pdf/pdf-tokens";
import { PDF_LAYOUT } from "@/modules/torres-vistoria/domain/laudo/pdf/pdf-table-layouts";

/** Filete horizontal fino — separador discreto entre blocos. */
export function ruleNode(
  width: number,
  options: { color?: string; thickness?: number; margin?: PdfMargin } = {},
): PdfNode {
  return {
    canvas: [
      {
        type: "line",
        x1: 0,
        y1: 0,
        x2: width,
        y2: 0,
        lineWidth: options.thickness ?? PDF_STROKE.hairline,
        lineColor: options.color ?? PDF_COLOR.border,
      },
    ],
    margin: options.margin ?? [0, 0, 0, PDF_SPACE.lg],
  };
}

/** Espaçador vertical explícito, para não depender de margens acumuladas. */
export function spacer(height: number): PdfNode {
  return { text: "", fontSize: 1, margin: [0, 0, 0, height] };
}

/**
 * Barra de seção: acento fino da marca + título navy + filete.
 * Sem bloco preenchido — a hierarquia vem da tipografia, não de faixas sólidas.
 */
export function sectionBar(
  title: string,
  options: {
    accent: string;
    width: number;
    kicker?: string;
    margin?: PdfMargin;
    pageBreak?: "before";
  },
): PdfNode {
  return {
    ...(options.pageBreak ? { pageBreak: options.pageBreak } : {}),
    margin: options.margin ?? [0, PDF_SPACE.xl, 0, PDF_SPACE.sm],
    stack: [
      {
        columns: [
          { width: 2.5, canvas: [{ type: "rect", x: 0, y: 1, w: 2.5, h: 10, color: options.accent }] },
          {
            width: "*",
            stack: [
              {
                text: title.toUpperCase(),
                color: PDF_COLOR.navy,
                bold: true,
                fontSize: PDF_FONT.h1,
                characterSpacing: PDF_TRACKING.wide,
              },
              ...(options.kicker
                ? [
                    {
                      text: options.kicker,
                      color: PDF_COLOR.muted,
                      fontSize: PDF_FONT.micro,
                      margin: [0, 2, 0, 0] as PdfMargin,
                    },
                  ]
                : []),
            ],
          },
        ],
        columnGap: PDF_SPACE.md,
      },
      ruleNode(options.width, { margin: [0, 3, 0, 0], thickness: PDF_STROKE.hairline, color: PDF_COLOR.borderStrong }),
    ],
  };
}

/**
 * Título de categoria (H3): uppercase, negrito e filete.
 * Sem barra de acento — a barra fica reservada às seções principais.
 */
export function subsectionHeading(
  title: string,
  options: { accent?: string; description?: string; margin?: PdfMargin; width?: number } = {},
): PdfNode {
  const width = options.width ?? PDF_PAGE.contentWidth;

  return {
    margin: options.margin ?? [0, PDF_SPACE.xl, 0, PDF_SPACE.md],
    stack: [
      {
        text: title.toUpperCase(),
        bold: true,
        fontSize: PDF_FONT.h2,
        color: PDF_COLOR.navy,
        characterSpacing: PDF_TRACKING.wide,
      },
      ...(options.description
        ? [
            {
              text: options.description,
              fontSize: PDF_FONT.micro,
              color: PDF_COLOR.muted,
              margin: [0, 1, 0, 0] as PdfMargin,
            },
          ]
        : []),
      ruleNode(width, {
        margin: [0, 4, 0, 0],
        thickness: PDF_STROKE.hairline,
        color: PDF_COLOR.borderStrong,
      }),
    ],
  };
}

export type PanelOptions = {
  title?: string;
  accent?: string;
  fill?: string;
  borderColor?: string;
  padding?: number;
  margin?: PdfMargin;
};

/** Caixa com borda hairline — agrupa conteúdo sem criar peso visual. */
export function panel(content: PdfNode[], options: PanelOptions = {}): PdfNode {
  const padding = options.padding ?? PDF_SPACE.lg;

  const stack: PdfNode[] = options.title
    ? [
        {
          text: options.title.toUpperCase(),
          fontSize: PDF_FONT.micro,
          bold: true,
          color: options.accent ?? PDF_COLOR.muted,
          characterSpacing: PDF_TRACKING.wide,
          margin: [0, 0, 0, PDF_SPACE.md],
        },
        ...content,
      ]
    : content;

  const inner: PdfNode = {
    stack,
    fillColor: options.fill,
    margin: [padding, padding, padding, padding],
  };

  return {
    margin: options.margin ?? [0, 0, 0, 0],
    table: options.accent
      ? {
          widths: [2.5, "*"],
          body: [[{ fillColor: options.accent, text: "" }, inner]],
        }
      : {
          widths: ["*"],
          body: [[inner]],
        },
    layout: PDF_LAYOUT.panel,
  };
}

/** Rótulo pequeno acima de um valor em destaque — unidade base dos grids. */
export function labelValueBlock(
  label: string,
  value: string,
  options: { valueColor?: string; valueSize?: number; margin?: PdfMargin } = {},
): PdfNode {
  return {
    margin: options.margin ?? [0, 0, 0, 0],
    stack: [
      {
        text: label.toUpperCase(),
        fontSize: PDF_FONT.micro,
        color: PDF_COLOR.muted,
        characterSpacing: PDF_TRACKING.normal,
      },
      {
        text: value,
        fontSize: options.valueSize ?? PDF_FONT.body,
        bold: true,
        color: options.valueColor ?? PDF_COLOR.text,
        margin: [0, 1.5, 0, 0],
        lineHeight: PDF_LINE_HEIGHT.tight,
      },
    ],
  };
}

/** Grade de pares rótulo/valor, sem bordas, com colunas de largura igual. */
export function labelValueGrid(
  rows: [string, string][],
  options: { columns?: number; margin?: PdfMargin; dividers?: boolean } = {},
): PdfNode | null {
  if (rows.length === 0) return null;
  const columns = options.columns ?? 3;

  const body: PdfNode[][] = [];
  for (let index = 0; index < rows.length; index += columns) {
    const slice = rows.slice(index, index + columns);
    body.push([
      ...slice.map(([label, value]) => labelValueBlock(label, value)),
      ...Array.from({ length: columns - slice.length }, () => ({ text: "" })),
    ]);
  }

  return {
    margin: options.margin ?? [0, 0, 0, 0],
    table: {
      widths: Array.from({ length: columns }, () => "*"),
      body,
    },
    layout: options.dividers ? PDF_LAYOUT.fieldsDivided : PDF_LAYOUT.fields,
  };
}

export type MetricItem = {
  label: string;
  value: string;
  accent?: string;
};

/** Faixa de indicadores sem cards — números em grid, separados por filetes. */
export function metricRow(
  items: MetricItem[],
  options: { margin?: PdfMargin } = {},
): PdfNode {
  if (items.length === 0) return { text: "" };

  return {
    margin: options.margin ?? [0, 0, 0, 0],
    table: {
      widths: items.map(() => "*"),
      body: [
        items.map((item) => ({
          stack: [
            {
              text: item.label.toUpperCase(),
              fontSize: PDF_FONT.micro,
              color: PDF_COLOR.muted,
              characterSpacing: PDF_TRACKING.normal,
            },
            {
              text: item.value,
              fontSize: PDF_FONT.kpi,
              bold: true,
              color: item.accent ?? PDF_COLOR.navy,
              margin: [0, 1, 0, 0],
              lineHeight: PDF_LINE_HEIGHT.tight,
            },
          ],
        })),
      ],
    },
    layout: PDF_LAYOUT.metrics,
  };
}

export type KpiCard = {
  label: string;
  value: string;
  accent: string;
  hint?: string;
};

/**
 * Linha de cards compactos com espaço real entre eles (colunas-gap na tabela),
 * o que evita as bordas coladas típicas de tabela de formulário.
 */
export function kpiCardRow(
  cards: KpiCard[],
  options: { width: number; gap?: number; margin?: PdfMargin },
): PdfNode {
  const gap = options.gap ?? PDF_SPACE.md;
  const cardWidth = Math.floor((options.width - gap * (cards.length - 1)) / cards.length);
  const padding = PDF_SPACE.md + 1;
  const barWidth = cardWidth - padding * 2;

  const widths: (number | string)[] = [];
  const row: PdfNode[] = [];

  cards.forEach((card, index) => {
    if (index > 0) {
      widths.push(gap);
      row.push({ text: "" });
    }
    widths.push(cardWidth);
    row.push({
      fillColor: PDF_COLOR.surface,
      margin: [padding, padding, padding, padding],
      stack: [
        { canvas: [{ type: "rect", x: 0, y: 0, w: barWidth, h: 2, color: card.accent }] },
        {
          text: card.label.toUpperCase(),
          fontSize: PDF_FONT.micro,
          color: PDF_COLOR.muted,
          characterSpacing: PDF_TRACKING.normal,
          margin: [0, PDF_SPACE.md, 0, 0],
        },
        {
          text: card.value,
          fontSize: PDF_FONT.kpi,
          bold: true,
          color: card.accent,
          margin: [0, 2, 0, 0],
          lineHeight: PDF_LINE_HEIGHT.tight,
        },
        ...(card.hint
          ? [
              {
                text: card.hint,
                fontSize: PDF_FONT.micro,
                color: PDF_COLOR.subtle,
                margin: [0, 1, 0, 0] as PdfMargin,
              },
            ]
          : []),
      ],
    });
  });

  return {
    margin: options.margin ?? [0, 0, 0, 0],
    table: { widths, body: [row] },
    layout: PDF_LAYOUT.none,
  };
}

/** Resultado em tipografia — destaque sem bloco sólido de cor. */
export function resultBadge(
  label: string,
  options: { accent: string; width: number; height?: number; fontSize?: number },
): PdfNode {
  const fontSize =
    options.fontSize ?? (label.length > 22 ? PDF_FONT.h1 : label.length > 14 ? PDF_FONT.result : PDF_FONT.display);

  return {
    stack: [
      { canvas: [{ type: "rect", x: 0, y: 0, w: 32, h: 2.5, color: options.accent }] },
      {
        text: label.toUpperCase(),
        color: options.accent,
        bold: true,
        fontSize,
        characterSpacing: PDF_TRACKING.wider,
        margin: [0, PDF_SPACE.xs, 0, 0],
      },
    ],
  };
}

/** Marcador circular de status, alinhado ao texto da mesma linha. */
export function statusDot(color: string, diameter = 5): PdfNode {
  const radius = diameter / 2;
  return {
    width: diameter + 1,
    canvas: [{ type: "ellipse", x: radius, y: radius + 2, r1: radius, r2: radius, color }],
  };
}

/** Badge de status — tipografia colorida, sem caixa interna. */
export function statusBadge(label: string, color: string): PdfNode {
  return {
    text: label.toUpperCase(),
    fontSize: PDF_FONT.micro,
    bold: true,
    color,
    alignment: "left",
    verticalAlignment: "middle",
    characterSpacing: PDF_TRACKING.normal,
  };
}

/** Achado numerado (apontamento ou avaria) — indicador lateral, sem card. */
export function findingRow(
  index: number,
  options: {
    kicker?: string;
    title: string;
    body?: string;
    accent: string;
    margin?: PdfMargin;
  },
): PdfNode {
  return {
    unbreakable: true,
    margin: options.margin ?? [0, 0, 0, PDF_SPACE.sm],
    table: {
      widths: [2.5, 22, "*"],
      body: [
        [
          { fillColor: options.accent, text: "" },
          {
            text: String(index + 1).padStart(2, "0"),
            fontSize: PDF_FONT.h2,
            bold: true,
            color: PDF_COLOR.navy,
            margin: [PDF_SPACE.sm, PDF_SPACE.sm, 0, PDF_SPACE.sm],
          },
          {
            margin: [0, PDF_SPACE.sm, PDF_SPACE.sm, PDF_SPACE.sm],
            stack: [
              ...(options.kicker
                ? [
                    {
                      text: options.kicker.toUpperCase(),
                      fontSize: PDF_FONT.micro,
                      bold: true,
                      color: PDF_COLOR.navy,
                      characterSpacing: PDF_TRACKING.wide,
                    },
                  ]
                : []),
              {
                text: options.title,
                fontSize: PDF_FONT.body,
                bold: true,
                color: PDF_COLOR.text,
                margin: [0, options.kicker ? 1 : 0, 0, 0],
              },
              ...(options.body
                ? [
                    {
                      text: options.body,
                      fontSize: PDF_FONT.small,
                      color: PDF_COLOR.muted,
                      margin: [0, 1, 0, 0],
                    },
                  ]
                : []),
            ],
          },
        ],
      ],
    },
    layout: PDF_LAYOUT.none,
  };
}

/** Status em linha: bolinha colorida + rótulo, imediatamente identificável. */
export function statusLabel(label: string, color: string, options: { bold?: boolean } = {}): PdfNode {
  return {
    columns: [
      statusDot(color, 4),
      {
        text: label,
        fontSize: PDF_FONT.micro,
        bold: options.bold ?? true,
        color,
        width: "*",
      },
    ],
    columnGap: PDF_SPACE.xs,
  };
}

/** Chip discreto para contagens ao lado de títulos de categoria. */
export function countChip(label: string, value: number, color: string): PdfNode {
  return {
    width: "auto",
    table: {
      widths: ["auto"],
      body: [
        [
          {
            text: `${value} ${label}`,
            fontSize: PDF_FONT.micro,
            bold: true,
            color,
            fillColor: PDF_COLOR.surface,
            margin: [PDF_SPACE.md, 2.5, PDF_SPACE.md, 2.5],
          },
        ],
      ],
    },
    layout: PDF_LAYOUT.none,
  };
}

export function bulletList(items: string[], options: { color?: string; margin?: PdfMargin } = {}): PdfNode {
  return {
    margin: options.margin ?? [0, 0, 0, 0],
    stack: items.map((item, index) => ({
      columns: [
        {
          width: 8,
          canvas: [
            {
              type: "ellipse",
              x: 2,
              y: 4,
              r1: 1.6,
              r2: 1.6,
              color: options.color ?? PDF_COLOR.muted,
            },
          ],
        },
        {
          width: "*",
          text: item,
          fontSize: PDF_FONT.body,
          color: PDF_COLOR.text,
          lineHeight: PDF_LINE_HEIGHT.normal,
        },
      ],
      columnGap: PDF_SPACE.xs,
      margin: [0, index === 0 ? 0 : PDF_SPACE.sm, 0, 0],
    })),
  };
}

/** Bloco monoespaçado visualmente (fundo + tracking) para hash e códigos. */
export function codeBlock(
  value: string,
  options: { fontSize?: number; color?: string; margin?: PdfMargin } = {},
): PdfNode {
  return {
    margin: options.margin ?? [0, 0, 0, 0],
    table: {
      widths: ["*"],
      body: [
        [
          {
            text: value,
            fontSize: options.fontSize ?? PDF_FONT.small,
            bold: true,
            color: options.color ?? PDF_COLOR.navy,
            characterSpacing: PDF_TRACKING.tight,
            fillColor: PDF_COLOR.surfaceAlt,
            margin: [PDF_SPACE.md, PDF_SPACE.sm, PDF_SPACE.md, PDF_SPACE.sm],
            lineHeight: PDF_LINE_HEIGHT.normal,
          },
        ],
      ],
    },
    layout: PDF_LAYOUT.code,
  };
}

export function tableHeaderCell(text: string): PdfNode {
  return {
    text: text.toUpperCase(),
    fontSize: PDF_FONT.micro,
    bold: true,
    color: PDF_COLOR.navy,
    characterSpacing: PDF_TRACKING.normal,
  };
}

/** Fotografia: fit + filete cinza 0.5pt. Sem caixa navy, sem matting branco. */
export function framedImage(
  dataUrl: string,
  options: { width: number; height: number; fill?: string },
): PdfNode {
  return {
    table: {
      widths: [options.width],
      heights: [options.height],
      body: [
        [
          {
            image: dataUrl,
            // `fit` é mais estável que `cover` no pdfmake 0.2 com dezenas de JPEGs.
            fit: [options.width, options.height],
            alignment: "center",
          },
        ],
      ],
    },
    layout: PDF_LAYOUT.photo,
  };
}

export const PDF_LAYOUT_HELPERS = { PDF_RADIUS, PDF_LAYOUT };

/** Layout de tabela premium: filetes horizontais leves, sem grade em todas as células. */
export function dataTableLayout(options: { grid?: boolean } = {}) {
  return options.grid ? PDF_LAYOUT.grid : PDF_LAYOUT.data;
}

/** Faixa de atenção — compacta, na altura da frase. */
export function attentionBanner(
  title: string,
  body: string,
  options: { width: number; accent: string; margin?: PdfMargin },
): PdfNode {
  const bar = 2.5;

  return {
    unbreakable: true,
    margin: options.margin ?? [0, PDF_SPACE.lg, 0, PDF_SPACE.md],
    table: {
      widths: [bar, options.width - bar],
      body: [
        [
          { fillColor: options.accent, text: "" },
          {
            fillColor: PDF_COLOR.attention,
            margin: [8, 6, 10, 6],
            columns: [
              {
                width: 9,
                text: "!",
                bold: true,
                fontSize: PDF_FONT.h2,
                color: options.accent,
              },
              {
                width: "*",
                stack: [
                  {
                    text: title.toUpperCase(),
                    bold: true,
                    fontSize: PDF_FONT.h2,
                    color: PDF_COLOR.navy,
                    characterSpacing: PDF_TRACKING.wide,
                  },
                  {
                    text: body,
                    fontSize: PDF_FONT.small,
                    color: PDF_COLOR.muted,
                    lineHeight: PDF_LINE_HEIGHT.tight,
                    margin: [0, 3, 0, 0],
                  },
                ],
              },
            ],
            columnGap: 6,
          },
        ],
      ],
    },
    layout: PDF_LAYOUT.panel,
  };
}
