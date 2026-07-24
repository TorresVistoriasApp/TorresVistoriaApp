import { InspectionSituation, InspectionStatus } from "@/lib/enums";
import { isFieldNA } from "@/lib/field-na";
import type { VistoriaInput } from "@/schemas/vistoria";

const now = () => new Date();

/** Valores sentinela gravados no banco para rascunhos (campos NOT NULL). */
export const DRAFT_PLACEHOLDER_VALUES = {
  location: "A definir",
  client_name: "Rascunho em andamento",
  plate: "AAA0A00",
  chassis: "00000000000000000",
  brand: "Pendente",
  model: "Pendente",
  color: "Pendente",
  fuel: "Pendente",
} as const satisfies Partial<Record<keyof VistoriaInput, string>>;

export const WIZARD_REQUIRED_DRAFT_FIELDS: Array<{ field: keyof typeof DRAFT_PLACEHOLDER_VALUES; label: string }> = [
  { field: "location", label: "Local da vistoria" },
  { field: "client_name", label: "Nome do contratante" },
  { field: "plate", label: "Placa" },
  { field: "chassis", label: "Chassi" },
  { field: "brand", label: "Marca" },
  { field: "model", label: "Modelo" },
  { field: "color", label: "Cor" },
  { field: "fuel", label: "Combustível" },
];

/** Valores mínimos para criar um rascunho vazio no Supabase (campos NOT NULL). */
export function buildEmptyDraftInput(): VistoriaInput {
  const date = now();
  const year = date.getFullYear();

  return {
    inspection_date: date.toISOString().slice(0, 10),
    inspection_time: date.toTimeString().slice(0, 5),
    location: DRAFT_PLACEHOLDER_VALUES.location,
    inspection_type_id: "",
    inspection_purpose: null,
    requester_name: "",
    requester_document: "",
    buyer_name: "",
    buyer_document: "",
    seller_name: "",
    seller_document: "",
    judicial_process: "",
    judicial_court: "",
    judicial_district: "",
    market_fipe_value: null,
    market_average_value: null,
    insurance_acceptance_percent: null,
    vehicle_condition: "",
    client_name: DRAFT_PLACEHOLDER_VALUES.client_name,
    client_document: "",
    client_phone: "",
    client_email: "",
    plate: DRAFT_PLACEHOLDER_VALUES.plate,
    chassis: DRAFT_PLACEHOLDER_VALUES.chassis,
    renavam: "",
    motor_number: "",
    vehicle_uf: "",
    registration_city_uf: "",
    vehicle_category: "",
    vehicle_species: "",
    passenger_capacity: null,
    power_cv: null,
    engine_displacement: null,
    brand: DRAFT_PLACEHOLDER_VALUES.brand,
    model: DRAFT_PLACEHOLDER_VALUES.model,
    version: "",
    color: DRAFT_PLACEHOLDER_VALUES.color,
    fuel: DRAFT_PLACEHOLDER_VALUES.fuel,
    manufacture_year: year,
    model_year: year,
    mileage: null,
    situation: InspectionSituation.PARTICULAR,
    opinion: undefined as unknown as VistoriaInput["opinion"],
    technical_notes: "",
    internal_notes: "",
    status: InspectionStatus.DRAFT,
  };
}

export function isPlaceholderDraftValue(field: string, value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === "string" && isFieldNA(value)) return true;
  if (typeof value === "string" && value.trim() === "") return true;

  const placeholder = DRAFT_PLACEHOLDER_VALUES[field as keyof typeof DRAFT_PLACEHOLDER_VALUES];
  return placeholder !== undefined && value === placeholder;
}
