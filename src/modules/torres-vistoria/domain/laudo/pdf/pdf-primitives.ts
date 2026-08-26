/**
 * Componentes visuais reutilizáveis do laudo PDF.
 *
 * Camada puramente de apresentação: recebe texto e cores já resolvidos e
 * devolve nós pdfmake. Nenhuma regra de negócio mora aqui.
 */
import {
  PDF_COLOR,
  PDF_FONT,
  PDF_ICON,
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
import {
  brazilFlagIcon,
  pdfIconBadge,
  type PdfIconName,
} from "@/modules/torres-vistoria/domain/laudo/pdf/pdf-icons";

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
 * Cabeçalho editorial de seção: ícone + título bold + subtítulo cinza + filete.
 * Substitui a barra sólida de sistemas genéricos por hierarquia tipográfica.
 */
export function sectionHeader(
  title: string,
  options: {
    accent: string;
    width: number;
    icon?: PdfIconName;
    subtitle?: string;
    kicker?: string;
    margin?: PdfMargin;
    pageBreak?: "before";
  },
): PdfNode {
  const subtitle = options.subtitle ?? options.kicker;
  const icon = options.icon
    ? pdfIconBadge(options.icon, {
        size: PDF_ICON.badgeSize,
        color: options.accent,
        fill: PDF_COLOR.orangeSoft,
      })
    : {
        width: 2.5,
        canvas: [{ type: "rect", x: 0, y: 2, w: 2.5, h: 14, color: options.accent }],
      };

  return {
    ...(options.pageBreak ? { pageBreak: options.pageBreak } : {}),
    unbreakable: true,
    margin: options.margin ?? [0, PDF_SPACE.section, 0, PDF_SPACE.md],
    stack: [
      {
        columns: [
          { width: PDF_ICON.badgeSize, ...icon },
          {
            width: "*",
            margin: [0, 1, 0, 0] as PdfMargin,
            stack: [
              {
                text: title.toUpperCase(),
                color: PDF_COLOR.navy,
                bold: true,
                fontSize: PDF_FONT.h1,
                characterSpacing: PDF_TRACKING.wide,
              },
              ...(subtitle
                ? [
                    {
                      text: subtitle,
                      color: PDF_COLOR.muted,
                      fontSize: PDF_FONT.subtitle,
                      margin: [0, 2, 0, 0] as PdfMargin,
                      lineHeight: PDF_LINE_HEIGHT.tight,
                    },
                  ]
                : []),
            ],
          },
        ],
        columnGap: PDF_SPACE.lg,
      },
      {
        canvas: [
          {
            type: "rect",
            x: 0,
            y: 0,
            w: 28,
            h: 1.5,
            color: options.accent,
          },
          {
            type: "line",
            x1: 28,
            y1: 0.75,
            x2: options.width,
            y2: 0.75,
            lineWidth: PDF_STROKE.hairline,
            lineColor: PDF_COLOR.borderStrong,
          },
        ],
        margin: [0, PDF_SPACE.md, 0, 0],
      },
    ],
  };
}

/** Compatível com builders legados — delega ao cabeçalho editorial. */
export function sectionBar(
  title: string,
  options: {
    accent: string;
    width: number;
    kicker?: string;
    subtitle?: string;
    icon?: PdfIconName;
    margin?: PdfMargin;
    pageBreak?: "before";
  },
): PdfNode {
  return sectionHeader(title, options);
}

/**
 * Moldura editorial: borda fina + acento laranja lateral.
 * Para seções curtas/médias. Seções longas usam só o cabeçalho.
 */
export function sectionFrame(
  content: PdfNode[],
  options: {
    accent: string;
    padding?: number;
    margin?: PdfMargin;
    fill?: string;
  },
): PdfNode {
  const padding = options.padding ?? PDF_SPACE.lg;

  return {
    margin: options.margin ?? [0, 0, 0, 0],
    table: {
      widths: [2.5, "*"],
      body: [
        [
          { fillColor: options.accent, text: "" },
          {
            stack: content,
            fillColor: options.fill ?? PDF_COLOR.white,
            margin: [padding, padding, padding, padding],
          },
        ],
      ],
    },
    layout: PDF_LAYOUT.sectionFrame,
  };
}

/**
 * Título de categoria: uppercase bold + filete com acento laranja.
 * Sem ícone pequeno — a identidade visual fica na rail da seção pai.
 */
export function subsectionHeading(
  title: string,
  options: {
    accent?: string;
    description?: string;
    margin?: PdfMargin;
    width?: number;
    icon?: PdfIconName;
  } = {},
): PdfNode {
  const width = options.width ?? PDF_PAGE.contentWidth;
  const accent = options.accent ?? PDF_COLOR.orange;

  return {
    unbreakable: true,
    margin: options.margin ?? [0, PDF_SPACE.xl, 0, PDF_SPACE.md],
    stack: [
      {
        columns: [
          {
            width: 3,
            canvas: [{ type: "rect", x: 0, y: 1, w: 3, h: 11, color: accent }],
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
            ],
          },
        ],
        columnGap: PDF_SPACE.sm,
      },
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

/** Marcador circular de status, alinhado ao texto da mesma linha. */
export function statusDot(color: string, diameter = 5): PdfNode {
  const radius = diameter / 2;
  return {
    width: diameter + 1,
    canvas: [{ type: "ellipse", x: radius, y: radius + 2, r1: radius, r2: radius, color }],
  };
}

/** Badge de status visual — soft fill + tipografia colorida, reconhecível em segundos. */
export function statusBadge(label: string, color: string, options: { soft?: string } = {}): PdfNode {
  const soft =
    options.soft ??
    (color === PDF_COLOR.success
      ? PDF_COLOR.successSoft
      : color === PDF_COLOR.warning
        ? PDF_COLOR.warningSoft
        : color === PDF_COLOR.danger
          ? PDF_COLOR.dangerSoft
          : color === PDF_COLOR.info
            ? PDF_COLOR.infoSoft
            : PDF_COLOR.neutralSoft);

  return {
    table: {
      widths: ["auto"],
      body: [
        [
          {
            columns: [
              statusDot(color, 4.5),
              {
                text: label.toUpperCase(),
                fontSize: PDF_FONT.micro,
                bold: true,
                color,
                characterSpacing: PDF_TRACKING.normal,
                width: "auto",
              },
            ],
            columnGap: 3,
            fillColor: soft,
            margin: [5, 3, 6, 3],
          },
        ],
      ],
    },
    layout: PDF_LAYOUT.statusChip,
  };
}

/** Resultado em tipografia — destaque com filete de acento e badge. */
export function resultBadge(
  label: string,
  options: { accent: string; width: number; height?: number; fontSize?: number },
): PdfNode {
  const fontSize =
    options.fontSize ?? (label.length > 22 ? PDF_FONT.h1 : label.length > 14 ? PDF_FONT.result : PDF_FONT.display);

  return {
    stack: [
      { canvas: [{ type: "rect", x: 0, y: 0, w: 36, h: 2.5, color: options.accent }] },
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

/** Faixa de identidade do veículo: logo + origem + marca/modelo/ano. */
export function vehicleIdentityStrip(options: {
  brand: string;
  model: string;
  year: string;
  brandLogoDataUrl?: string | null;
  originLabel?: string | null;
  originCountryCode?: string | null;
  accent: string;
}): PdfNode {
  const originNodes: PdfNode[] = [];
  if (options.originLabel) {
    originNodes.push({
      columns: [
        ...(options.originCountryCode === "BR" ? [{ width: 18, ...brazilFlagIcon(11) }] : []),
        {
          text: options.originLabel.toUpperCase(),
          fontSize: PDF_FONT.micro,
          bold: true,
          color: PDF_COLOR.navy,
          characterSpacing: PDF_TRACKING.wide,
          width: "auto",
        },
      ],
      columnGap: 4,
      margin: [0, 0, 0, PDF_SPACE.sm],
    });
  }

  return {
    unbreakable: true,
    margin: [0, 0, 0, PDF_SPACE.md],
    columns: [
      {
        width: 64,
        stack: [
          ...(options.brandLogoDataUrl
            ? [{ image: options.brandLogoDataUrl, fit: [56, 28], margin: [0, 0, 0, PDF_SPACE.xs] }]
            : [
                {
                  text: options.brand.slice(0, 12).toUpperCase(),
                  bold: true,
                  fontSize: PDF_FONT.h2,
                  color: options.accent,
                },
              ]),
          ...originNodes,
        ],
      },
      {
        width: "*",
        columns: [
          labelValueBlock("Fabricante", options.brand, { valueSize: PDF_FONT.h2 }),
          labelValueBlock("Modelo", options.model, { valueSize: PDF_FONT.h2 }),
          labelValueBlock("Ano", options.year, { valueSize: PDF_FONT.h2 }),
        ],
        columnGap: PDF_SPACE.lg,
      },
    ],
    columnGap: PDF_SPACE.xl,
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

/** Fotografia: fit + filete cinza. Moldura premium discreta, sem matting pesado. */
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
            fit: [options.width, options.height],
            alignment: "center",
            fillColor: options.fill ?? PDF_COLOR.surface,
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
