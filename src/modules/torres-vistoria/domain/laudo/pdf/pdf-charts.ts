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

/** Passo angular da aproximação do arco: 2° deixa o anel liso na impressão. */
const ARC_STEP_RADIANS = Math.PI / 90;
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
  centerValueFontSize?: number;
  centerLabelFontSize?: number;
  /** Cor do anel quando não há nenhum dado positivo. */
  emptyColor?: string;
};

const CENTER_VALUE_FONT = 12;
const CENTER_LABEL_FONT = 6;

const GAUGE_START = -Math.PI / 2;
const GAUGE_SWEEP = Math.PI;
/** Folga entre fatias mistas para o anel não parecer uma mancha. */
const SEGMENT_GAP = 0.03;

/** Reprojeta fatias do círculo completo para o semicírculo superior (gauge). */
export function computeGaugeSegments(slices: DonutSlice[]): DonutSegment[] {
  return computeDonutSegments(slices).map((segment) => ({
    ...segment,
    startAngle: GAUGE_START + (segment.startAngle / FULL_TURN) * GAUGE_SWEEP,
    endAngle: GAUGE_START + (segment.endAngle / FULL_TURN) * GAUGE_SWEEP,
  }));
}

function withSegmentGap(
  segment: Pick<DonutSegment, "startAngle" | "endAngle">,
): Pick<DonutSegment, "startAngle" | "endAngle"> {
  const sweep = segment.endAngle - segment.startAngle;
  if (sweep <= SEGMENT_GAP * 3) return segment;
  return {
    startAngle: segment.startAngle + SEGMENT_GAP / 2,
    endAngle: segment.endAngle - SEGMENT_GAP / 2,
  };
}

function ringPolyline(
  segment: Pick<DonutSegment, "startAngle" | "endAngle">,
  geometry: { cx: number; cy: number; outerRadius: number; innerRadius: number },
  color: string,
): Record<string, unknown> {
  return {
    type: "polyline",
    closePath: true,
    color,
    lineWidth: 0,
    lineColor: color,
    points: buildRingSectorPoints(segment, geometry),
  };
}

function fullRingEllipses(
  geometry: { cx: number; cy: number; outerRadius: number; innerRadius: number },
  color: string,
): Array<Record<string, unknown>> {
  const { cx, cy, outerRadius, innerRadius } = geometry;
  return [
    { type: "ellipse", x: cx, y: cy, r1: outerRadius, r2: outerRadius, color },
    { type: "ellipse", x: cx, y: cy, r1: innerRadius, r2: innerRadius, color: PDF_COLOR.white },
  ];
}

function capDot(
  geometry: { cx: number; cy: number; outerRadius: number; innerRadius: number },
  angle: number,
  color: string,
): Record<string, unknown> {
  const mid = (geometry.outerRadius + geometry.innerRadius) / 2;
  const radius = (geometry.outerRadius - geometry.innerRadius) / 2;
  const point = polarPoint(geometry.cx, geometry.cy, mid, angle);
  return { type: "ellipse", x: point.x, y: point.y, r1: radius, r2: radius, color };
}

function donutCanvasOps(
  slices: DonutSlice[],
  geometry: { cx: number; cy: number; outerRadius: number; innerRadius: number },
  emptyColor: string,
): Array<Record<string, unknown>> {
  const segments = computeDonutSegments(slices);
  if (segments.length === 0) return fullRingEllipses(geometry, emptyColor);
  if (segments.length === 1) return fullRingEllipses(geometry, segments[0]!.color);

  return segments.map((segment) => ringPolyline(withSegmentGap(segment), geometry, segment.color));
}

function gaugeCanvasOps(
  slices: DonutSlice[],
  geometry: { cx: number; cy: number; outerRadius: number; innerRadius: number },
  emptyColor: string,
): Array<Record<string, unknown>> {
  const segments = computeGaugeSegments(slices);
  const track = ringPolyline(
    { startAngle: GAUGE_START, endAngle: GAUGE_START + GAUGE_SWEEP },
    geometry,
    emptyColor,
  );

  if (segments.length === 0) {
    return [track, capDot(geometry, GAUGE_START, emptyColor), capDot(geometry, GAUGE_START + GAUGE_SWEEP, emptyColor)];
  }

  const rings = segments.map((segment) =>
    ringPolyline(
      segments.length === 1 ? segment : withSegmentGap(segment),
      geometry,
      segment.color,
    ),
  );

  return [
    ...rings,
    capDot(geometry, GAUGE_START, segments[0]!.color),
    capDot(geometry, GAUGE_START + GAUGE_SWEEP, segments[segments.length - 1]!.color),
  ];
}

/**
 * Texto central sobre o canvas. O espaçador restaura a altura do gráfico
 * para o overlay não colapsar o fluxo nem deixar faixa vazia embaixo.
 */
function chartWithCenterLabel(
  canvasOps: unknown[],
  box: { width: number; height: number },
  options: DonutChartOptions,
  captionTop: number,
): PdfNode {
  const value = options.centerValue ?? "";
  const label = (options.centerLabel ?? "").toUpperCase();
  if (!value && !label) {
    return { canvas: canvasOps, width: box.width };
  }

  const valueSize = options.centerValueFontSize ?? CENTER_VALUE_FONT;
  const labelSize = options.centerLabelFontSize ?? CENTER_LABEL_FONT;
  const captionHeight = (value ? valueSize * 1.12 : 0) + (label ? labelSize * 1.2 + 1 : 0);
  const pull = box.height - captionTop;
  const spacer = Math.max(pull - captionHeight, 0);

  return {
    width: box.width,
    stack: [
      { canvas: canvasOps },
      {
        text: value,
        fontSize: valueSize,
        bold: true,
        color: PDF_COLOR.navy,
        alignment: "center",
        margin: [0, -pull, 0, 0],
      },
      {
        text: label,
        fontSize: labelSize,
        color: PDF_COLOR.muted,
        characterSpacing: label.length > 14 ? PDF_TRACKING.tight : PDF_TRACKING.wide,
        alignment: "center",
        margin: [0, 1, 0, 0],
      },
      { text: "", fontSize: 1, margin: [0, spacer, 0, 0] },
    ],
  };
}

/** Donut circular. Anel único vira elipses concêntricas — nítido na impressão. */
export function buildDonutChartNode(slices: DonutSlice[], options: DonutChartOptions = {}): PdfNode {
  const size = options.size ?? 96;
  const thickness = options.thickness ?? Math.round(size * 0.22);
  const outerRadius = size / 2;
  const innerRadius = Math.max(outerRadius - thickness, 1);
  const geometry = { cx: outerRadius, cy: outerRadius, outerRadius, innerRadius };
  const ops = donutCanvasOps(slices, geometry, options.emptyColor ?? PDF_COLOR.border);
  const valueSize = options.centerValueFontSize ?? CENTER_VALUE_FONT;
  const captionTop = size / 2 - valueSize * 0.75;

  return chartWithCenterLabel(ops, { width: size, height: size }, options, captionTop);
}

/**
 * Gauge em ferradura. Tampas circulares nas extremidades e texto no oco,
 * sem a faixa vazia da metade inferior de um círculo completo.
 */
export function buildGaugeChartNode(slices: DonutSlice[], options: DonutChartOptions = {}): PdfNode {
  const size = options.size ?? 156;
  const thickness = options.thickness ?? Math.round(size * 0.2);
  const outerRadius = size / 2;
  const innerRadius = Math.max(outerRadius - thickness, 1);
  const geometry = { cx: outerRadius, cy: outerRadius, outerRadius, innerRadius };
  const height = outerRadius + thickness / 2;
  const ops = gaugeCanvasOps(slices, geometry, options.emptyColor ?? PDF_COLOR.surfaceAlt);
  const captionTop = outerRadius * 0.42;

  return chartWithCenterLabel(ops, { width: size, height }, options, captionTop);
}

function legendSwatch(color: string): PdfNode {
  return {
    width: 11,
    canvas: [{ type: "ellipse", x: 5, y: 5.5, r1: 4.2, r2: 4.2, color }],
  };
}

export type ChartLegendOptions = {
  /** Exibe o percentual ao lado do valor absoluto. */
  showPercentage?: boolean;
  /** Mantém na legenda fatias zeradas (útil para mostrar "0 reprovados"). */
  includeEmpty?: boolean;
  /** Sufixo do valor, ex.: " itens". */
  unit?: string;
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
      const count = options.unit ? `${slice.value} ${options.unit}` : `${slice.value}`;
      const suffix = options.showPercentage === false ? "" : ` · ${percentage}%`;

      return {
        columns: [
          legendSwatch(slice.color),
          {
            text: slice.label,
            fontSize: PDF_FONT.small,
            color: PDF_COLOR.text,
            width: "*",
          },
          {
            text: `${count}${suffix}`,
            fontSize: PDF_FONT.h2,
            bold: true,
            color: PDF_COLOR.navy,
            alignment: "right",
            width: "auto",
          },
        ],
        columnGap: PDF_SPACE.sm,
        margin: [0, index === 0 ? 0 : PDF_SPACE.md, 0, 0],
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
