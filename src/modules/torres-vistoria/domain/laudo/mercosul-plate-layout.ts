import type { Inspection } from "@/modules/torres-vistoria/services/inspection-service";

export const MERCOSUL_BLUE = "#003087";
export const PLATE_BORDER = "#1e293b";
export const PLATE_BODY = "#ffffff";
export const PLATE_BORDER_WIDTH = 0.5;

export const MERCOSUL_PLATE_BR_COL = 10;
export const MERCOSUL_PLATE_HEADER_HEIGHT = 6.5;
export const MERCOSUL_PLATE_BODY_HEIGHT = 13;
export const MERCOSUL_PLATE_TOTAL_HEIGHT = MERCOSUL_PLATE_HEADER_HEIGHT + MERCOSUL_PLATE_BODY_HEIGHT;
export const MERCOSUL_PLATE_WIDTH = 92;

export const HEADER_VALIDATION_MIN_WIDTH = 104;
export const HEADER_OPINION_HEIGHT = MERCOSUL_PLATE_TOTAL_HEIGHT;
export const HEADER_QR_SIZE = 88;

export const PLATE_BR_FONT_SIZE = 3.8;
export const PLATE_LOCATION_FONT_SIZE = 4.2;
export const PLATE_LOCATION_FONT_MIN = 3;
export const PLATE_NUMBER_FONT_SIZE = 10.5;
export const PLATE_NUMBER_FONT_MIN = 8.5;
export const PLATE_NUMBER_TRACKING = 0.35;

/** Placa da capa — retângulo baixo, letras preenchendo o campo branco. */
export const COVER_PLATE_BR_COL = 12;
export const COVER_PLATE_HEADER_HEIGHT = 7;
export const COVER_PLATE_BODY_HEIGHT = 16;
export const COVER_PLATE_TOTAL_HEIGHT = COVER_PLATE_HEADER_HEIGHT + COVER_PLATE_BODY_HEIGHT;
export const COVER_PLATE_WIDTH = 108;
export const COVER_PLATE_BR_FONT_SIZE = 4.2;
export const COVER_PLATE_LOCATION_FONT_SIZE = 4.6;
export const COVER_PLATE_LOCATION_FONT_MIN = 3.6;
export const COVER_PLATE_NUMBER_FONT_SIZE = 14.5;
export const COVER_PLATE_NUMBER_FONT_MIN = 12;
export const COVER_PLATE_NUMBER_TRACKING = 0.4;

function normalizeCity(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/\s+/g, " ");
}

export function mercosulPlateGraphicWidth(plateText: string): number {
  const compactLength = plateText.replace(/-/g, "").length;
  return Math.min(100, Math.max(MERCOSUL_PLATE_WIDTH, Math.round(compactLength * 6.4 + 20)));
}

export function coverPlateGraphicWidth(plateText: string): number {
  const compactLength = plateText.replace(/-/g, "").length;
  return Math.min(118, Math.max(COVER_PLATE_WIDTH, Math.round(compactLength * 7.4 + 28)));
}

export function headerValidationWidth(plateText: string): number {
  return Math.max(HEADER_VALIDATION_MIN_WIDTH, mercosulPlateGraphicWidth(plateText));
}

/** Rótulo da faixa azul (município-UF), conforme emplacamento informado na vistoria. */
export function buildMercosulPlateLocationLabel(
  inspection: Pick<Inspection, "registration_city_uf" | "vehicle_uf">,
): string {
  const city = inspection.registration_city_uf?.trim();
  const uf = inspection.vehicle_uf?.trim()?.toUpperCase();

  if (city) {
    const normalized = normalizeCity(city);

    if (normalized.includes("-") && normalized.length <= 18) return normalized;
    if (uf) return `${normalized}-${uf}`.slice(0, 18);
    return normalized.slice(0, 18);
  }

  if (uf) return `BRASIL-${uf}`;
  return "BRASIL";
}

export function estimateTextWidthPt(text: string, fontSize: number, characterSpacing = 0): number {
  return text.split("").reduce((width, char) => {
    const charWidth = char === " " ? fontSize * 0.34 : fontSize * 0.56;
    return width + charWidth + characterSpacing;
  }, 0);
}

export function fitFontSize(
  text: string,
  maxWidth: number,
  baseSize: number,
  minSize: number,
  characterSpacing = 0,
): number {
  if (!text) return baseSize;

  let size = baseSize;
  while (size > minSize && estimateTextWidthPt(text, size, characterSpacing) > maxWidth) {
    size -= 0.2;
  }

  return Math.max(minSize, Math.round(size * 10) / 10);
}

export function fitPlateNumberFontSize(plateText: string, maxWidth: number): number {
  return fitFontSize(plateText, maxWidth, PLATE_NUMBER_FONT_SIZE, PLATE_NUMBER_FONT_MIN, PLATE_NUMBER_TRACKING);
}

export function fitCoverPlateNumberFontSize(plateText: string, maxWidth: number): number {
  return fitFontSize(
    plateText,
    maxWidth,
    COVER_PLATE_NUMBER_FONT_SIZE,
    COVER_PLATE_NUMBER_FONT_MIN,
    COVER_PLATE_NUMBER_TRACKING,
  );
}

export function fitLocationFontSize(locationLabel: string, maxWidth: number): number {
  return fitFontSize(
    locationLabel,
    maxWidth,
    PLATE_LOCATION_FONT_SIZE,
    PLATE_LOCATION_FONT_MIN,
    0.1,
  );
}

export function fitCoverLocationFontSize(locationLabel: string, maxWidth: number): number {
  return fitFontSize(
    locationLabel,
    maxWidth,
    COVER_PLATE_LOCATION_FONT_SIZE,
    COVER_PLATE_LOCATION_FONT_MIN,
    0.12,
  );
}

export function getMercosulPlateColumnWidths(graphicWidth: number): [number, number] {
  return [MERCOSUL_PLATE_BR_COL, graphicWidth - MERCOSUL_PLATE_BR_COL];
}

export function getCoverPlateColumnWidths(graphicWidth: number): [number, number] {
  return [COVER_PLATE_BR_COL, graphicWidth - COVER_PLATE_BR_COL];
}

/** Compensa o alinhamento vertical do pdfmake, que não centra o texto na célula. */
export function plateTextTopOffset(cellHeight: number, fontSize: number): number {
  return Math.max(0, (cellHeight - fontSize) / 2 - 0.45);
}
