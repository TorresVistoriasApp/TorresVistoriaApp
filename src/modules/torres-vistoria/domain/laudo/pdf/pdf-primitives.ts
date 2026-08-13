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
  PDF_RADIUS,
  PDF_SPACE,
  PDF_STROKE,
  PDF_TRACKING,
  type PdfMargin,
  type PdfNode,
} from "@/modules/torres-vistoria/domain/laudo/pdf/pdf-tokens";

const NO_PADDING = {
  paddingLeft: () => 0,
  paddingRight: () => 0,
  paddingTop: () => 0,
  paddingBottom: () => 0,
};

const NO_BORDER = {
  hLineWidth: () => 0,
  vLineWidth: () => 0,
};

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
    margin: options.margin ?? [0, PDF_SPACE.lg, 0, PDF_SPACE.sm],
    stack: [
      {
        columns: [
          { width: 3, canvas: [{ type: "rect", x: 0, y: 1, w: 3, h: 11, color: options.accent }] },
          {
            width: "*",
            stack: [
              {
                text: title.toUpperCase(),
                color: PDF_COLOR.navy,
                bold: true,
                fontSize: PDF_FONT.h2,
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
      ruleNode(options.width, { margin: [0, PDF_SPACE.sm, 0, 0] }),
    ],
  };
}

/** Título de subseção: barra de acento fina + rótulo, sem peso de fundo. */
export function subsectionHeading(
  title: string,
  options: { accent: string; description?: string; margin?: PdfMargin } = { accent: PDF_COLOR.navy },
): PdfNode {
  return {
    margin: options.margin ?? [0, PDF_SPACE.md, 0, PDF_SPACE.xs],
    columns: [
      { width: 2.5, canvas: [{ type: "rect", x: 0, y: 1, w: 2.5, h: 9, color: options.accent }] },
      {
        width: "*",
        stack: [
          {
            text: title,
            bold: true,
            fontSize: PDF_FONT.h3,
            color: PDF_COLOR.navy,
            characterSpacing: PDF_TRACKING.tight,
          },
          ...(options.description
            ? [
                {
                  text: options.description,
                  fontSize: PDF_FONT.micro,
                  color: PDF_COLOR.muted,
                  margin: [0, 1.5, 0, 0] as PdfMargin,
                },
              ]
            : []),
        ],
      },
    ],
    columnGap: PDF_SPACE.md,
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
  const borderColor = options.borderColor ?? PDF_COLOR.border;

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

  return {
    margin: options.margin ?? [0, 0, 0, 0],
    table: {
      widths: ["*"],
      body: [[{ stack, fillColor: options.fill, margin: [padding, padding, padding, padding] }]],
    },
    layout: {
      ...NO_PADDING,
      hLineWidth: () => PDF_STROKE.hairline,
      vLineWidth: () => PDF_STROKE.hairline,
      hLineColor: () => borderColor,
      vLineColor: () => borderColor,
    },
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
  const dividers = options.dividers ?? false;

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
    layout: {
      hLineWidth: (rowIndex: number) => (dividers && rowIndex > 0 ? PDF_STROKE.hairline : 0),
      vLineWidth: () => 0,
      hLineColor: () => PDF_COLOR.border,
      paddingLeft: (columnIndex: number) => (columnIndex === 0 ? 0 : PDF_SPACE.md),
      paddingRight: () => PDF_SPACE.md,
      paddingTop: () => (dividers ? PDF_SPACE.xs : 0),
      paddingBottom: () => PDF_SPACE.sm,
    },
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
    layout: {
      hLineWidth: (rowIndex: number, node: { table: { body: unknown[] } }) =>
        rowIndex === 0 || rowIndex === node.table.body.length ? PDF_STROKE.hairline : 0,
      vLineWidth: (columnIndex: number) =>
        columnIndex === 0 || columnIndex === items.length ? 0 : PDF_STROKE.hairline,
      hLineColor: () => PDF_COLOR.border,
      vLineColor: () => PDF_COLOR.border,
      paddingLeft: (columnIndex: number) => (columnIndex === 0 ? 0 : PDF_SPACE.md),
      paddingRight: () => PDF_SPACE.sm,
      paddingTop: () => PDF_SPACE.sm,
      paddingBottom: () => PDF_SPACE.sm,
    },
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
    layout: { ...NO_BORDER, ...NO_PADDING },
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

/** Status em linha: bolinha colorida + rótulo, imediatamente identificável. */
export function statusLabel(label: string, color: string, options: { bold?: boolean } = {}): PdfNode {
  return {
    columns: [
      statusDot(color),
      {
        text: label,
        fontSize: PDF_FONT.small,
        bold: options.bold ?? true,
        color,
        width: "*",
      },
    ],
    columnGap: PDF_SPACE.sm,
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
    layout: { ...NO_BORDER, ...NO_PADDING },
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
    layout: {
      ...NO_PADDING,
      hLineWidth: () => PDF_STROKE.hairline,
      vLineWidth: () => PDF_STROKE.hairline,
      hLineColor: () => PDF_COLOR.border,
      vLineColor: () => PDF_COLOR.border,
    },
  };
}

/** Layout de tabela padrão do laudo: apenas hairlines horizontais e zebra. */
export function dataTableLayout(options: { headerFill?: string } = {}) {
  return {
    hLineWidth: (rowIndex: number, node: { table: { body: unknown[] } }) =>
      rowIndex === 0 || rowIndex === 1 || rowIndex === node.table.body.length
        ? PDF_STROKE.thin
        : PDF_STROKE.hairline,
    vLineWidth: () => 0,
    hLineColor: (rowIndex: number) =>
      rowIndex === 0 || rowIndex === 1 ? PDF_COLOR.borderStrong : PDF_COLOR.border,
    fillColor: (rowIndex: number) =>
      rowIndex === 0 ? (options.headerFill ?? PDF_COLOR.surfaceAlt) : rowIndex % 2 === 0 ? PDF_COLOR.surface : null,
    paddingLeft: () => PDF_SPACE.sm,
    paddingRight: () => PDF_SPACE.sm,
    paddingTop: () => 2,
    paddingBottom: () => 2,
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

/** Moldura de imagem com altura fixa: preserva proporção e alinha a grade. */
export function framedImage(
  dataUrl: string,
  options: { width: number; height: number; fill?: string },
): PdfNode {
  const inset = 1;

  return {
    table: {
      widths: [options.width],
      heights: [options.height],
      body: [
        [
          {
            image: dataUrl,
            fit: [options.width - inset * 2, options.height - inset * 2],
            alignment: "center",
            verticalAlignment: "middle",
            fillColor: options.fill ?? PDF_COLOR.white,
            margin: [inset, inset, inset, inset],
          },
        ],
      ],
    },
    layout: {
      ...NO_PADDING,
      hLineWidth: () => PDF_STROKE.hairline,
      vLineWidth: () => PDF_STROKE.hairline,
      hLineColor: () => PDF_COLOR.border,
      vLineColor: () => PDF_COLOR.border,
    },
  };
}

export const PDF_LAYOUT_HELPERS = { NO_BORDER, NO_PADDING, PDF_RADIUS };

/** Faixa de atenção — destaque editorial compacto, sem card. */
export function attentionBanner(
  title: string,
  body: string,
  options: { width: number; accent: string; margin?: PdfMargin },
): PdfNode {
  return {
    unbreakable: true,
    margin: options.margin ?? [0, PDF_SPACE.md, 0, PDF_SPACE.sm],
    table: {
      widths: [options.width],
      body: [
        [
          {
            text: title.toUpperCase(),
            fillColor: PDF_COLOR.navy,
            color: options.accent,
            bold: true,
            fontSize: PDF_FONT.micro,
            characterSpacing: PDF_TRACKING.wider,
            margin: [PDF_SPACE.md, 3, PDF_SPACE.md, 3],
          },
        ],
        [
          {
            text: body,
            fillColor: PDF_COLOR.warningSoft,
            color: PDF_COLOR.text,
            fontSize: PDF_FONT.small,
            bold: true,
            lineHeight: PDF_LINE_HEIGHT.tight,
            margin: [PDF_SPACE.md, PDF_SPACE.sm, PDF_SPACE.md, PDF_SPACE.sm],
          },
        ],
      ],
    },
    layout: { ...NO_BORDER, ...NO_PADDING },
  };
}
