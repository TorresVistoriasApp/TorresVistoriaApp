/**
 * Silhueta técnica do veículo para a seção de pintura/estrutura do laudo.
 *
 * A geometria é vista superior (frente no topo). Os indicadores usam apenas
 * estados derivados do view-model — nada é inferido visualmente.
 */
import {
  PDF_COLOR,
  PDF_FONT,
  PDF_PAGE,
  PDF_SPACE,
  PDF_TRACKING,
  type PdfNode,
} from "@/modules/torres-vistoria/domain/laudo/pdf/pdf-tokens";
import { labelValueBlock, subsectionHeading } from "@/modules/torres-vistoria/domain/laudo/pdf/pdf-primitives";
import {
  ZONE_STATE_COLOR,
  ZONE_STATE_LABEL,
  type LaudoPaintZone,
} from "@/modules/torres-vistoria/domain/laudo/pdf/laudo-report-view-model";

/** Proporção da silhueta no PDF — igual ao asset 704×1269 (frente no topo). */
export const SILHOUETTE_WIDTH = 132;
export const SILHOUETTE_HEIGHT = 238;

type Point = { x: number; y: number };

export function mapZonePoint(
  zone: Pick<LaudoPaintZone, "x" | "y">,
  width = SILHOUETTE_WIDTH,
  height = SILHOUETTE_HEIGHT,
): Point {
  return {
    x: zone.x * width,
    y: zone.y * height,
  };
}

export function buildPaintZoneMarkerOps(
  zones: LaudoPaintZone[],
  size: { width: number; height: number } = { width: SILHOUETTE_WIDTH, height: SILHOUETTE_HEIGHT },
): Record<string, unknown>[] {
  return zones.map((zone) => {
    const point = mapZonePoint(zone, size.width, size.height);
    const color = ZONE_STATE_COLOR[zone.state];
    const radius = zone.state === "AVARIA" ? 5.4 : zone.state === "REGISTRADA" ? 4.6 : 3.2;
    return {
      type: "ellipse",
      x: point.x,
      y: point.y,
      r1: radius,
      r2: radius,
      color,
      lineWidth: 0.7,
      lineColor: PDF_COLOR.white,
    };
  });
}

/** @deprecated Use buildPaintZoneMarkerOps — mantido para os testes de geometria. */
export function buildPaintSilhouetteCanvasOps(zones: LaudoPaintZone[]) {
  return buildPaintZoneMarkerOps(zones);
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

  const legendWidth = PDF_PAGE.contentWidth - SILHOUETTE_WIDTH - PDF_SPACE.xl;

  return {
    stack: [
      subsectionHeading("Legenda das regiões", {
        margin: [0, 0, 0, PDF_SPACE.sm],
        width: legendWidth,
      }),
      {
        columns: [
          { width: 10, canvas: [{ type: "ellipse", x: 3, y: 5, r1: 3, r2: 3, color: ZONE_STATE_COLOR.AVARIA }] },
          { width: "*", text: ZONE_STATE_LABEL.AVARIA, fontSize: PDF_FONT.micro, color: PDF_COLOR.text },
        ],
        columnGap: PDF_SPACE.md,
        margin: [0, 0, 0, 3],
      },
      {
        columns: [
          { width: 10, canvas: [{ type: "ellipse", x: 3, y: 5, r1: 3, r2: 3, color: ZONE_STATE_COLOR.REGISTRADA }] },
          { width: "*", text: ZONE_STATE_LABEL.REGISTRADA, fontSize: PDF_FONT.micro, color: PDF_COLOR.text },
        ],
        columnGap: PDF_SPACE.md,
        margin: [0, 0, 0, PDF_SPACE.md],
      },
      ...items.map((item, index) => ({
        ...item,
        margin: [0, index === 0 ? 0 : PDF_SPACE.sm, 0, 0],
      })),
    ],
  };
}

function vehicleDiagram(zones: LaudoPaintZone[], imageDataUrl?: string): PdfNode {
  const markers = {
    canvas: buildPaintZoneMarkerOps(zones),
    width: SILHOUETTE_WIDTH,
    height: SILHOUETTE_HEIGHT,
  };

  if (!imageDataUrl) {
    return markers;
  }

  return {
    unbreakable: true,
    stack: [
      {
        image: imageDataUrl,
        width: SILHOUETTE_WIDTH,
        height: SILHOUETTE_HEIGHT,
      },
      {
        ...markers,
        margin: [0, -SILHOUETTE_HEIGHT, 0, 0],
      },
    ],
  };
}

export function buildPaintSilhouetteNode(
  zones: LaudoPaintZone[],
  imageDataUrl?: string,
): PdfNode {
  return {
    columns: [
      {
        width: SILHOUETTE_WIDTH,
        stack: [
          {
        text: "FRENTE",
        fontSize: PDF_FONT.micro,
        bold: true,
        color: PDF_COLOR.subtle,
        alignment: "center",
        characterSpacing: PDF_TRACKING.wider,
        margin: [0, 0, 0, PDF_SPACE.sm],
          },
          vehicleDiagram(zones, imageDataUrl),
          {
            text: "TRASEIRA",
            fontSize: PDF_FONT.micro,
            bold: true,
            color: PDF_COLOR.subtle,
            alignment: "center",
            characterSpacing: PDF_TRACKING.wider,
            margin: [0, PDF_SPACE.sm, 0, 0],
          },
        ],
      },
      { width: PDF_SPACE.xl, text: "" },
      { width: "*", ...zoneLegend(zones) },
    ],
  };
}
