import { InspectionSituation, InspectionStatus } from "@/lib/enums";
import type { VistoriaInput } from "@/schemas/vistoria";

const now = () => new Date();

/** Valores mínimos para criar um rascunho vazio no Supabase (campos NOT NULL). */
export function buildEmptyDraftInput(): VistoriaInput {
  const date = now();
  const year = date.getFullYear();

  return {
    inspection_date: date.toISOString().slice(0, 10),
    inspection_time: date.toTimeString().slice(0, 5),
    location: "A definir",
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
    client_name: "Rascunho em andamento",
    client_document: "00000000000",
    client_phone: "",
    client_email: "",
    plate: "AAA0A00",
    chassis: "00000000000000000",
    renavam: "",
    motor_number: "",
    vehicle_uf: "",
    registration_city_uf: "",
    vehicle_category: "",
    vehicle_species: "",
    passenger_capacity: null,
    power_cv: null,
    engine_displacement: null,
    brand: "Pendente",
    model: "Pendente",
    version: "",
    color: "Pendente",
    fuel: "Pendente",
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
  if (value === null || value === undefined || value === "") return true;

  const placeholders: Record<string, unknown> = {
    client_name: "Rascunho em andamento",
    client_document: "00000000000",
    plate: "AAA0A00",
    chassis: "00000000000000000",
    brand: "Pendente",
    model: "Pendente",
    color: "Pendente",
    fuel: "Pendente",
    location: "A definir",
  };

  return placeholders[field] === value;
}
