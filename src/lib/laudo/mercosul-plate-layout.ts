import type { Inspection } from "@/services/inspection-service";

export const MERCOSUL_BLUE = "#003087";
export const PLATE_BORDER = "#1e293b";
export const PLATE_BODY = "#ffffff";
export const PLATE_BORDER_WIDTH = 0.5;

export const MERCOSUL_PLATE_BR_COL = 8;
export const MERCOSUL_PLATE_HEADER_HEIGHT = 8;
export const MERCOSUL_PLATE_BODY_HEIGHT = 14;
export const MERCOSUL_PLATE_TOTAL_HEIGHT = MERCOSUL_PLATE_HEADER_HEIGHT + MERCOSUL_PLATE_BODY_HEIGHT;
export const MERCOSUL_PLATE_WIDTH = 100;

export const HEADER_VALIDATION_MIN_WIDTH = 104;
export const HEADER_OPINION_HEIGHT = MERCOSUL_PLATE_TOTAL_HEIGHT;
export const HEADER_QR_SIZE = 88;

export const PLATE_BR_FONT_SIZE = 3.6;
export const PLATE_LOCATION_FONT_SIZE = 4.4;
export const PLATE_LOCATION_FONT_MIN = 3;
export const PLATE_NUMBER_FONT_SIZE = 9.5;
export const PLATE_NUMBER_FONT_MIN = 8;

function normalizeCity(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/\s+/g, " ");
}

export function mercosulPlateGraphicWidth(plateText: string): number {
  const compactLength = plateText.replace(/-/g, "").length;
  return Math.min(108, Math.max(MERCOSUL_PLATE_WIDTH, Math.round(compactLength * 6.2 + 24)));
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
  return fitFontSize(plateText, maxWidth, PLATE_NUMBER_FONT_SIZE, PLATE_NUMBER_FONT_MIN, 0.45);
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

export function getMercosulPlateColumnWidths(graphicWidth: number): [number, number] {
  return [MERCOSUL_PLATE_BR_COL, graphicWidth - MERCOSUL_PLATE_BR_COL];
}
