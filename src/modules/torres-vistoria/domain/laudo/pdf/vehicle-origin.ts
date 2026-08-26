/**
 * Origem/nacionalidade do veículo no PDF.
 *
 * Extensível para futuras integrações de consulta. Só exibe quando houver
 * dado real — nunca inventa bandeira ou país.
 */
import type { LaudoPayload } from "@/modules/torres-vistoria/domain/laudo/laudo-model";
import { hasLaudoValue, inspectionText } from "@/modules/torres-vistoria/domain/laudo/laudo-field-utils";

export type VehicleOriginInfo = {
  countryCode: "BR" | string;
  label: string;
};

const BRAZIL_LABELS = new Set([
  "brasil",
  "brazil",
  "br",
  "nacional",
  "brasileiro",
  "brasileira",
]);

function normalizeOrigin(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

/**
 * Resolve origem a partir de campos opcionais do payload.
 * Aceita: vehicle_origin, nationality, origin_country, vehicle_nationality.
 */
export function resolveVehicleOrigin(
  inspection: LaudoPayload["inspection"],
): VehicleOriginInfo | null {
  const candidates = [
    inspectionText(inspection, "vehicle_origin"),
    inspectionText(inspection, "nationality"),
    inspectionText(inspection, "origin_country"),
    inspectionText(inspection, "vehicle_nationality"),
  ].filter((value): value is string => hasLaudoValue(value));

  if (candidates.length === 0) return null;

  const raw = candidates[0]!;
  const normalized = normalizeOrigin(raw);

  if (BRAZIL_LABELS.has(normalized) || normalized.includes("brasil") || normalized.includes("nacional")) {
    return { countryCode: "BR", label: "Brasil" };
  }

  return { countryCode: raw.slice(0, 2).toUpperCase(), label: raw };
}
