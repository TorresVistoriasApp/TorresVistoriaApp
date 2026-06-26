import { formatPlate } from "@/lib/formatters";
import type { Inspection } from "@/services/inspection-service";
import {
  buildMercosulPlateLocationLabel,
  fitLocationFontSize,
  fitPlateNumberFontSize,
  getMercosulPlateColumnWidths,
  MERCOSUL_BLUE,
  MERCOSUL_PLATE_BODY_HEIGHT,
  MERCOSUL_PLATE_HEADER_HEIGHT,
  MERCOSUL_PLATE_TOTAL_HEIGHT,
  PLATE_BODY,
  PLATE_BORDER,
  PLATE_BORDER_WIDTH,
  PLATE_BR_FONT_SIZE,
  mercosulPlateGraphicWidth,
} from "@/lib/laudo/mercosul-plate-layout";

export {
  HEADER_OPINION_HEIGHT,
  HEADER_QR_SIZE,
  HEADER_VALIDATION_MIN_WIDTH,
  MERCOSUL_PLATE_BODY_HEIGHT,
  MERCOSUL_PLATE_BR_COL,
  MERCOSUL_PLATE_HEADER_HEIGHT,
  MERCOSUL_PLATE_TOTAL_HEIGHT,
  MERCOSUL_PLATE_WIDTH,
  buildMercosulPlateLocationLabel,
  headerValidationWidth,
  mercosulPlateGraphicWidth,
} from "@/lib/laudo/mercosul-plate-layout";

type PdfNode = Record<string, unknown>;

const PLATE_TABLE_LAYOUT = {
  paddingLeft: () => 0,
  paddingRight: () => 0,
  paddingTop: () => 0,
  paddingBottom: () => 0,
  hLineWidth: () => PLATE_BORDER_WIDTH,
  vLineWidth: () => PLATE_BORDER_WIDTH,
  hLineColor: () => PLATE_BORDER,
  vLineColor: () => PLATE_BORDER,
};

/** Placa Mercosul para o cabeçalho do laudo PDF (pdfmake). */
export function buildMercosulPlatePdfNode(
  plate: string | null | undefined,
  inspection: Pick<Inspection, "registration_city_uf" | "vehicle_uf">,
): PdfNode {
  const plateText = formatPlate(plate);
  const locationLabel = buildMercosulPlateLocationLabel(inspection);
  const graphicWidth = mercosulPlateGraphicWidth(plateText);
  const [brColWidth, locationColWidth] = getMercosulPlateColumnWidths(graphicWidth);
  const locationFontSize = fitLocationFontSize(locationLabel, locationColWidth - 2);
  const plateFontSize = fitPlateNumberFontSize(plateText, graphicWidth - 4);

  return {
    unbreakable: true,
    table: {
      widths: [brColWidth, locationColWidth],
      heights: [MERCOSUL_PLATE_HEADER_HEIGHT, MERCOSUL_PLATE_BODY_HEIGHT],
      body: [
        [
          {
            text: "BR",
            color: "#ffffff",
            fillColor: MERCOSUL_BLUE,
            bold: true,
            fontSize: PLATE_BR_FONT_SIZE,
            alignment: "center",
            verticalAlignment: "middle",
            lineHeight: 1,
            margin: [0, 0, 0, 0],
          },
          {
            text: locationLabel,
            color: "#ffffff",
            fillColor: MERCOSUL_BLUE,
            bold: true,
            fontSize: locationFontSize,
            alignment: "center",
            verticalAlignment: "middle",
            characterSpacing: 0.1,
            lineHeight: 1,
            noWrap: true,
            margin: [0, 0, 0, 0],
          },
        ],
        [
          {
            colSpan: 2,
            text: plateText,
            fillColor: PLATE_BODY,
            bold: true,
            fontSize: plateFontSize,
            alignment: "center",
            verticalAlignment: "middle",
            color: "#0f172a",
            characterSpacing: 0.45,
            lineHeight: 1,
            noWrap: true,
            margin: [0, 0, 0, 0],
          },
          {},
        ],
      ],
    },
    layout: PLATE_TABLE_LAYOUT,
  };
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
