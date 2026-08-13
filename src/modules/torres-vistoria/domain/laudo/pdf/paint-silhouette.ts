/**
 * Silhueta técnica do veículo para a seção de pintura/estrutura do laudo.
 *
 * A geometria é vista superior (frente no topo). Os indicadores usam apenas
 * estados derivados do view-model — nada é inferido visualmente.
 */
import {
  PDF_COLOR,
  PDF_FONT,
  PDF_SPACE,
  PDF_TRACKING,
  type PdfNode,
} from "@/modules/torres-vistoria/domain/laudo/pdf/pdf-tokens";
import { labelValueBlock } from "@/modules/torres-vistoria/domain/laudo/pdf/pdf-primitives";
import {
  ZONE_STATE_COLOR,
  ZONE_STATE_LABEL,
  type LaudoPaintZone,
} from "@/modules/torres-vistoria/domain/laudo/pdf/laudo-report-view-model";

export const SILHOUETTE_WIDTH = 168;
export const SILHOUETTE_HEIGHT = 248;

type Point = { x: number; y: number };

const BODY_OUTLINE: Point[] = [
  { x: 62, y: 10 },
  { x: 106, y: 10 },
  { x: 122, y: 22 },
  { x: 132, y: 42 },
  { x: 136, y: 70 },
  { x: 140, y: 108 },
  { x: 140, y: 156 },
  { x: 134, y: 196 },
  { x: 122, y: 222 },
  { x: 106, y: 238 },
  { x: 62, y: 238 },
  { x: 46, y: 222 },
  { x: 34, y: 196 },
  { x: 28, y: 156 },
  { x: 28, y: 108 },
  { x: 32, y: 70 },
  { x: 36, y: 42 },
  { x: 46, y: 22 },
];

const CABIN_OUTLINE: Point[] = [
  { x: 50, y: 78 },
  { x: 118, y: 78 },
  { x: 124, y: 96 },
  { x: 124, y: 168 },
  { x: 116, y: 190 },
  { x: 52, y: 190 },
  { x: 44, y: 168 },
  { x: 44, y: 96 },
];

function polyline(
  points: Point[],
  options: { color: string; lineWidth: number; closePath?: boolean; fill?: string },
) {
  return {
    type: "polyline" as const,
    points,
    closePath: options.closePath ?? true,
    lineWidth: options.lineWidth,
    lineColor: options.color,
    ...(options.fill ? { color: options.fill } : {}),
  };
}

function mapZonePoint(zone: LaudoPaintZone): Point {
  return {
    x: 18 + zone.x * (SILHOUETTE_WIDTH - 36),
    y: 12 + zone.y * (SILHOUETTE_HEIGHT - 24),
  };
}

export function buildPaintSilhouetteCanvasOps(zones: LaudoPaintZone[]) {
  const bodyStroke = PDF_COLOR.navy;
  const cabinStroke = "#94a3b8";

  const ops: Record<string, unknown>[] = [
    polyline(BODY_OUTLINE, { color: bodyStroke, lineWidth: 1.15, fill: "#f8fafc" }),
    polyline(CABIN_OUTLINE, { color: cabinStroke, lineWidth: 0.7 }),
    {
      type: "line",
      x1: 52,
      y1: 56,
      x2: 116,
      y2: 56,
      lineWidth: 0.6,
      lineColor: cabinStroke,
    },
    {
      type: "line",
      x1: 54,
      y1: 206,
      x2: 114,
      y2: 206,
      lineWidth: 0.6,
      lineColor: cabinStroke,
    },
    {
      type: "line",
      x1: 84,
      y1: 28,
      x2: 84,
      y2: 226,
      lineWidth: 0.4,
      lineColor: PDF_COLOR.border,
    },
    { type: "ellipse", x: 22, y: 78, r1: 7, r2: 16, lineWidth: 0.8, lineColor: bodyStroke },
    { type: "ellipse", x: 146, y: 78, r1: 7, r2: 16, lineWidth: 0.8, lineColor: bodyStroke },
    { type: "ellipse", x: 22, y: 178, r1: 7, r2: 16, lineWidth: 0.8, lineColor: bodyStroke },
    { type: "ellipse", x: 146, y: 178, r1: 7, r2: 16, lineWidth: 0.8, lineColor: bodyStroke },
  ];

  for (const zone of zones) {
    const point = mapZonePoint(zone);
    const color = ZONE_STATE_COLOR[zone.state];
    const radius = zone.state === "AVARIA" ? 5.2 : zone.state === "REGISTRADA" ? 4.4 : 3.2;
    ops.push({
      type: "ellipse",
      x: point.x,
      y: point.y,
      r1: radius,
      r2: radius,
      color,
      lineWidth: 0.6,
      lineColor: PDF_COLOR.white,
    });
  }

  return ops;
}

function zoneLegend(zones: LaudoPaintZone[]): PdfNode {
  const recorded = zones.filter((zone) => zone.state !== "SEM_REGISTRO");
  const items =
    recorded.length > 0
      ? recorded.map((zone) =>
          labelValueBlock(
            zone.label,
            zone.detail ? `${ZONE_STATE_LABEL[zone.state]} · ${zone.detail}` : ZONE_STATE_LABEL[zone.state],
            { valueColor: ZONE_STATE_COLOR[zone.state], valueSize: PDF_FONT.small },
          ),
        )
      : [
          {
            text: "Nenhuma região possui registro fotográfico específico ou avaria mapeada nesta vistoria.",
            fontSize: PDF_FONT.small,
            color: PDF_COLOR.muted,
          },
        ];

  return {
    stack: [
      {
        text: "LEGENDA DAS REGIÕES",
        fontSize: PDF_FONT.micro,
        bold: true,
        color: PDF_COLOR.muted,
        characterSpacing: PDF_TRACKING.wide,
        margin: [0, 0, 0, PDF_SPACE.md],
      },
      {
        columns: [
          { width: 10, canvas: [{ type: "ellipse", x: 3, y: 5, r1: 3, r2: 3, color: ZONE_STATE_COLOR.AVARIA }] },
          { width: "*", text: ZONE_STATE_LABEL.AVARIA, fontSize: PDF_FONT.micro, color: PDF_COLOR.text },
        ],
        columnGap: 6,
        margin: [0, 0, 0, 3],
      },
      {
        columns: [
          { width: 10, canvas: [{ type: "ellipse", x: 3, y: 5, r1: 3, r2: 3, color: ZONE_STATE_COLOR.REGISTRADA }] },
          { width: "*", text: ZONE_STATE_LABEL.REGISTRADA, fontSize: PDF_FONT.micro, color: PDF_COLOR.text },
        ],
        columnGap: 6,
        margin: [0, 0, 0, PDF_SPACE.md],
      },
      ...items.map((item, index) => ({
        ...item,
        margin: [0, index === 0 ? 0 : PDF_SPACE.sm, 0, 0],
      })),
    ],
  };
}

export function buildPaintSilhouetteNode(zones: LaudoPaintZone[]): PdfNode {
  return {
    columns: [
      {
        width: SILHOUETTE_WIDTH,
        stack: [
          {
            text: "FRENTE",
            fontSize: PDF_FONT.micro,
            bold: true,
            color: PDF_COLOR.muted,
            alignment: "center",
            characterSpacing: PDF_TRACKING.wide,
            margin: [0, 0, 0, PDF_SPACE.sm],
          },
          {
            canvas: buildPaintSilhouetteCanvasOps(zones),
            width: SILHOUETTE_WIDTH,
            height: SILHOUETTE_HEIGHT,
          },
          {
            text: "TRASEIRA",
            fontSize: PDF_FONT.micro,
            bold: true,
            color: PDF_COLOR.muted,
            alignment: "center",
            characterSpacing: PDF_TRACKING.wide,
            margin: [0, PDF_SPACE.sm, 0, 0],
          },
        ],
      },
      { width: PDF_SPACE.xl, text: "" },
      { width: "*", ...zoneLegend(zones) },
    ],
  };
}
