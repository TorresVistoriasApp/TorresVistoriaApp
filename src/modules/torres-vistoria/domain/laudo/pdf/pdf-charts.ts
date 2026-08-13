/**
 * Gráficos donut/pizza para o laudo PDF.
 *
 * O pdfmake não possui primitiva de arco: cada fatia é um polígono em anel
 * (arco externo à ida, arco interno à volta) aproximado por segmentos de reta.
 * A geometria é pura e testável; o nó pdfmake é montado a partir dela.
 */
import {
  PDF_COLOR,
  PDF_FONT,
  PDF_SPACE,
  PDF_TRACKING,
  type PdfNode,
} from "@/modules/torres-vistoria/domain/laudo/pdf/pdf-tokens";

export type DonutSlice = {
  label: string;
  value: number;
  color: string;
};

export type DonutSegment = {
  label: string;
  color: string;
  value: number;
  /** Fração do total, entre 0 e 1. */
  ratio: number;
  /** Radianos, 0 = topo do círculo, sentido horário. */
  startAngle: number;
  endAngle: number;
};

/** Passo angular da aproximação do arco: 6° mantém a curva lisa a 100pt. */
const ARC_STEP_RADIANS = Math.PI / 30;
const FULL_TURN = Math.PI * 2;

/**
 * Converte valores absolutos em segmentos angulares. Fatias com valor zero ou
 * negativo são descartadas — o gráfico representa apenas dados reais.
 */
export function computeDonutSegments(slices: DonutSlice[]): DonutSegment[] {
  const positive = slices.filter((slice) => slice.value > 0);
  const total = positive.reduce((sum, slice) => sum + slice.value, 0);
  if (total <= 0) return [];

  let cursor = 0;
  return positive.map((slice, index) => {
    const ratio = slice.value / total;
    const startAngle = cursor;
    const endAngle = index === positive.length - 1 ? FULL_TURN : cursor + ratio * FULL_TURN;
    cursor = endAngle;
    return { label: slice.label, color: slice.color, value: slice.value, ratio, startAngle, endAngle };
  });
}

type Point = { x: number; y: number };

function polarPoint(cx: number, cy: number, radius: number, angle: number): Point {
  return {
    x: cx + radius * Math.sin(angle),
    y: cy - radius * Math.cos(angle),
  };
}

/**
 * Polígono em anel que aproxima uma fatia do donut. Exportado para os testes
 * conseguirem validar o fechamento e o raio dos pontos gerados.
 */
export function buildRingSectorPoints(
  segment: Pick<DonutSegment, "startAngle" | "endAngle">,
  geometry: { cx: number; cy: number; outerRadius: number; innerRadius: number },
): Point[] {
  const { cx, cy, outerRadius, innerRadius } = geometry;
  const sweep = segment.endAngle - segment.startAngle;
  const steps = Math.max(2, Math.ceil(sweep / ARC_STEP_RADIANS));
  const outer: Point[] = [];
  const inner: Point[] = [];

  for (let step = 0; step <= steps; step += 1) {
    const angle = segment.startAngle + (sweep * step) / steps;
    outer.push(polarPoint(cx, cy, outerRadius, angle));
    inner.push(polarPoint(cx, cy, innerRadius, angle));
  }

  return [...outer, ...inner.reverse()];
}

export type DonutChartOptions = {
  size?: number;
  /** Espessura do anel em pontos. */
  thickness?: number;
  centerValue?: string;
  centerLabel?: string;
  /** Cor do anel quando não há nenhum dado positivo. */
  emptyColor?: string;
};

const CENTER_VALUE_FONT = 12;
const CENTER_LABEL_FONT = 6;
/** Altura aproximada das duas linhas centrais, para o recuo negativo. */
const CENTER_BLOCK_HEIGHT = 21;

/**
 * Donut pdfmake. O rótulo central é posicionado com margem negativa sobre o
 * canvas e compensado por um espaçador, mantendo o fluxo do documento intacto.
 */
export function buildDonutChartNode(slices: DonutSlice[], options: DonutChartOptions = {}): PdfNode {
  const size = options.size ?? 96;
  const thickness = options.thickness ?? Math.round(size * 0.26);
  const outerRadius = size / 2;
  const innerRadius = Math.max(outerRadius - thickness, 1);
  const cx = outerRadius;
  const cy = outerRadius;
  const segments = computeDonutSegments(slices);

  const ops =
    segments.length > 0
      ? segments.map((segment) => ({
          type: "polyline",
          closePath: true,
          color: segment.color,
          lineWidth: 0,
          lineColor: segment.color,
          points: buildRingSectorPoints(segment, { cx, cy, outerRadius, innerRadius }),
        }))
      : [
          {
            type: "polyline",
            closePath: true,
            color: options.emptyColor ?? PDF_COLOR.border,
            lineWidth: 0,
            lineColor: options.emptyColor ?? PDF_COLOR.border,
            points: buildRingSectorPoints(
              { startAngle: 0, endAngle: FULL_TURN },
              { cx, cy, outerRadius, innerRadius },
            ),
          },
        ];

  const hasCenterText = Boolean(options.centerValue || options.centerLabel);
  if (!hasCenterText) {
    return { canvas: ops, width: size };
  }

  const offsetUp = outerRadius + CENTER_BLOCK_HEIGHT / 2;

  return {
    width: size,
    stack: [
      { canvas: ops },
      {
        text: options.centerValue ?? "",
        fontSize: CENTER_VALUE_FONT,
        bold: true,
        color: PDF_COLOR.navy,
        alignment: "center",
        margin: [0, -offsetUp, 0, 0],
      },
      {
        text: (options.centerLabel ?? "").toUpperCase(),
        fontSize: CENTER_LABEL_FONT,
        color: PDF_COLOR.muted,
        characterSpacing: PDF_TRACKING.normal,
        alignment: "center",
      },
      { text: "", fontSize: 1, margin: [0, offsetUp - CENTER_BLOCK_HEIGHT, 0, 0] },
    ],
  };
}

/** Quadradinho de cor usado nas legendas dos gráficos. */
function legendSwatch(color: string): PdfNode {
  return {
    width: 7,
    canvas: [{ type: "rect", x: 0, y: 1.5, w: 6, h: 6, r: 1, color }],
  };
}

export type ChartLegendOptions = {
  /** Exibe o percentual ao lado do valor absoluto. */
  showPercentage?: boolean;
  /** Mantém na legenda fatias zeradas (útil para mostrar "0 reprovados"). */
  includeEmpty?: boolean;
};

export function buildChartLegendNode(
  slices: DonutSlice[],
  options: ChartLegendOptions = {},
): PdfNode {
  const total = slices.reduce((sum, slice) => sum + Math.max(slice.value, 0), 0);
  const visible = options.includeEmpty ? slices : slices.filter((slice) => slice.value > 0);

  if (visible.length === 0) {
    return { text: "Sem dados para exibir.", fontSize: PDF_FONT.micro, color: PDF_COLOR.muted };
  }

  return {
    stack: visible.map((slice, index) => {
      const percentage = total > 0 ? Math.round((slice.value / total) * 100) : 0;
      const suffix = options.showPercentage === false ? "" : ` · ${percentage}%`;

      return {
        columns: [
          legendSwatch(slice.color),
          {
            text: slice.label,
            fontSize: PDF_FONT.micro,
            color: PDF_COLOR.text,
            width: "*",
          },
          {
            text: `${slice.value}${suffix}`,
            fontSize: PDF_FONT.micro,
            bold: true,
            color: PDF_COLOR.navy,
            alignment: "right",
            width: "auto",
          },
        ],
        columnGap: PDF_SPACE.xs,
        margin: [0, index === 0 ? 0 : PDF_SPACE.sm, 0, 0],
      };
    }),
  };
}

/** Barra horizontal segmentada — leitura rápida de proporção em uma linha. */
export function buildStackedBarNode(
  slices: DonutSlice[],
  options: { width: number; height?: number },
): PdfNode {
  const height = options.height ?? 6;
  const total = slices.reduce((sum, slice) => sum + Math.max(slice.value, 0), 0);

  if (total <= 0) {
    return {
      canvas: [
        { type: "rect", x: 0, y: 0, w: options.width, h: height, r: 1, color: PDF_COLOR.border },
      ],
    };
  }

  const positive = slices.filter((slice) => slice.value > 0);
  let cursor = 0;

  const rects = positive.map((slice, index) => {
    const isLast = index === positive.length - 1;
    const width = isLast
      ? options.width - cursor
      : Math.max(Math.round((slice.value / total) * options.width), 1);
    const rect = { type: "rect", x: cursor, y: 0, w: width, h: height, color: slice.color };
    cursor += width;
    return rect;
  });

  return { canvas: rects };
}
