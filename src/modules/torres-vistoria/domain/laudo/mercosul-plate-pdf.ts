import { PDF_LAYOUT } from "@/modules/torres-vistoria/domain/laudo/pdf/pdf-table-layouts";
import { formatPlate } from "@/shared/lib/formatters";
import type { Inspection } from "@/modules/torres-vistoria/services/inspection-service";
import {
  COVER_PLATE_BODY_HEIGHT,
  COVER_PLATE_BR_COL,
  COVER_PLATE_BR_FONT_SIZE,
  COVER_PLATE_HEADER_HEIGHT,
  COVER_PLATE_NUMBER_TRACKING,
  MERCOSUL_BLUE,
  MERCOSUL_PLATE_BODY_HEIGHT,
  MERCOSUL_PLATE_BR_COL,
  MERCOSUL_PLATE_HEADER_HEIGHT,
  MERCOSUL_PLATE_TOTAL_HEIGHT,
  PLATE_BODY,
  PLATE_BR_FONT_SIZE,
  PLATE_NUMBER_TRACKING,
  buildMercosulPlateLocationLabel,
  coverPlateGraphicWidth,
  fitCoverLocationFontSize,
  fitCoverPlateNumberFontSize,
  fitLocationFontSize,
  fitPlateNumberFontSize,
  mercosulPlateGraphicWidth,
  plateTextTopOffset,
} from "@/modules/torres-vistoria/domain/laudo/mercosul-plate-layout";

export {
  COVER_PLATE_BODY_HEIGHT,
  COVER_PLATE_HEADER_HEIGHT,
  COVER_PLATE_TOTAL_HEIGHT,
  COVER_PLATE_WIDTH,
  HEADER_OPINION_HEIGHT,
  HEADER_QR_SIZE,
  HEADER_VALIDATION_MIN_WIDTH,
  MERCOSUL_PLATE_BODY_HEIGHT,
  MERCOSUL_PLATE_BR_COL,
  MERCOSUL_PLATE_HEADER_HEIGHT,
  MERCOSUL_PLATE_TOTAL_HEIGHT,
  MERCOSUL_PLATE_WIDTH,
  buildMercosulPlateLocationLabel,
  coverPlateGraphicWidth,
  headerValidationWidth,
  mercosulPlateGraphicWidth,
} from "@/modules/torres-vistoria/domain/laudo/mercosul-plate-layout";

type PdfNode = Record<string, unknown>;

function buildPlateNode(
  plateText: string,
  locationLabel: string,
  metrics: {
    width: number;
    headerHeight: number;
    bodyHeight: number;
    brCol: number;
    brFontSize: number;
    locationFontSize: number;
    plateFontSize: number;
    plateTracking: number;
  },
): PdfNode {
  const headerOffset = plateTextTopOffset(metrics.headerHeight, metrics.locationFontSize);
  const bodyOffset = plateTextTopOffset(metrics.bodyHeight, metrics.plateFontSize);

  return {
    unbreakable: true,
    width: metrics.width,
    table: {
      widths: [metrics.width],
      heights: [metrics.headerHeight, metrics.bodyHeight],
      body: [
        [
          {
            fillColor: MERCOSUL_BLUE,
            margin: [3, headerOffset, 3, 0],
            columns: [
              {
                width: metrics.brCol,
                text: "BR",
                color: "#ffffff",
                bold: true,
                fontSize: metrics.brFontSize,
                alignment: "left",
                lineHeight: 1,
              },
              {
                width: "*",
                text: locationLabel,
                color: "#ffffff",
                bold: true,
                fontSize: metrics.locationFontSize,
                alignment: "center",
                characterSpacing: 0.08,
                lineHeight: 1,
                noWrap: true,
              },
            ],
            columnGap: 2,
          },
        ],
        [
          {
            text: plateText,
            fillColor: PLATE_BODY,
            bold: true,
            fontSize: metrics.plateFontSize,
            alignment: "center",
            color: "#0f172a",
            characterSpacing: metrics.plateTracking,
            lineHeight: 1,
            noWrap: true,
            margin: [2, bodyOffset, 2, 0],
          },
        ],
      ],
    },
    layout: PDF_LAYOUT.plate,
  };
}

/** Placa Mercosul para o cabeçalho do laudo PDF (pdfmake). */
export function buildMercosulPlatePdfNode(
  plate: string | null | undefined,
  inspection: Pick<Inspection, "registration_city_uf" | "vehicle_uf">,
): PdfNode {
  const plateText = formatPlate(plate);
  const locationLabel = buildMercosulPlateLocationLabel(inspection);
  const width = mercosulPlateGraphicWidth(plateText);

  return buildPlateNode(plateText, locationLabel, {
    width,
    headerHeight: MERCOSUL_PLATE_HEADER_HEIGHT,
    bodyHeight: MERCOSUL_PLATE_BODY_HEIGHT,
    brCol: MERCOSUL_PLATE_BR_COL,
    brFontSize: PLATE_BR_FONT_SIZE,
    locationFontSize: fitLocationFontSize(locationLabel, width - MERCOSUL_PLATE_BR_COL - 10),
    plateFontSize: fitPlateNumberFontSize(plateText, width - 8),
    plateTracking: PLATE_NUMBER_TRACKING,
  });
}

/** Placa Mercosul em tamanho de capa — compacta, letras preenchendo o campo. */
export function buildCoverPlatePdfNode(
  plate: string | null | undefined,
  inspection: Pick<Inspection, "registration_city_uf" | "vehicle_uf">,
): PdfNode {
  const plateText = formatPlate(plate);
  const locationLabel = buildMercosulPlateLocationLabel(inspection);
  const width = coverPlateGraphicWidth(plateText);

  return buildPlateNode(plateText, locationLabel, {
    width,
    headerHeight: COVER_PLATE_HEADER_HEIGHT,
    bodyHeight: COVER_PLATE_BODY_HEIGHT,
    brCol: COVER_PLATE_BR_COL,
    brFontSize: COVER_PLATE_BR_FONT_SIZE,
    locationFontSize: fitCoverLocationFontSize(locationLabel, width - COVER_PLATE_BR_COL - 12),
    plateFontSize: fitCoverPlateNumberFontSize(plateText, width - 10),
    plateTracking: COVER_PLATE_NUMBER_TRACKING,
  });
}

/** Bloco compacto: rótulo + placa Mercosul. */
export function buildMercosulPlateLabelGroup(
  plate: string | null | undefined,
  inspection: Pick<Inspection, "registration_city_uf" | "vehicle_uf">,
  topOffset = 2,
): PdfNode {
  const labelMarginTop = topOffset + Math.round((MERCOSUL_PLATE_TOTAL_HEIGHT - 8) / 2);

  return {
    columns: [
      {
        text: "Placa:",
        width: 26,
        fontSize: 8,
        color: "#64748b",
        margin: [0, labelMarginTop, 0, 0],
      },
      {
        ...buildMercosulPlatePdfNode(plate, inspection),
        margin: [0, topOffset, 0, 0],
      },
    ],
    columnGap: 4,
    width: "auto",
  };
}

/** Placa + parecer/QR agrupados, sem espaço flexível entre eles. */
export function buildPlateAndValidationGroup(
  plate: string | null | undefined,
  inspection: Pick<Inspection, "registration_city_uf" | "vehicle_uf">,
  validationStack: PdfNode,
  topOffset = 2,
): PdfNode {
  return {
    columns: [
      buildMercosulPlateLabelGroup(plate, inspection, topOffset),
      { ...validationStack, margin: [4, topOffset, 0, 0] as [number, number, number, number] },
    ],
    columnGap: 4,
    width: "auto",
  };
}
