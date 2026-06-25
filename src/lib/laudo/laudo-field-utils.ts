import { formatCurrency, formatDocument, formatKM, formatPlate } from "@/lib/formatters";
import { isFieldNA } from "@/lib/field-na";
import type { LaudoPayload } from "@/lib/laudo/laudo-model";

type Inspection = LaudoPayload["inspection"];

export function hasLaudoValue(value: string | number | null | undefined): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === "number") return !Number.isNaN(value);
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 && !isFieldNA(trimmed);
  }
  return true;
}

export function inspectionField(
  inspection: Inspection,
  key: string,
): string | number | null | undefined {
  const data = inspection as unknown as Record<string, unknown>;
  const result = data[key];
  if (typeof result === "string" || typeof result === "number") return result;
  return null;
}

export function inspectionText(inspection: Inspection, key: string): string | null {
  const value = inspectionField(inspection, key);
  if (typeof value !== "string" || !hasLaudoValue(value)) return null;
  return value.trim();
}

export function buildFilledInfoRows(
  rows: [string, string | null | undefined][],
): [string, string][] {
  return rows.filter(([, content]) => hasLaudoValue(content)) as [string, string][];
}

const SALE_MARKET_FIELDS = [
  "buyer_name",
  "buyer_document",
  "seller_name",
  "seller_document",
  "judicial_process",
  "judicial_court",
  "judicial_district",
  "market_fipe_value",
  "market_average_value",
  "insurance_acceptance_percent",
] as const;

export function hasSaleMarketSectionData(inspection: Inspection): boolean {
  return SALE_MARKET_FIELDS.some((field) => hasLaudoValue(inspectionField(inspection, field)));
}

export function buildSaleMarketInfoRows(inspection: Inspection): [string, string][] {
  const buyerName = inspectionText(inspection, "buyer_name");
  const buyerDocument = inspectionText(inspection, "buyer_document");
  const sellerName = inspectionText(inspection, "seller_name");
  const sellerDocument = inspectionText(inspection, "seller_document");

  const rows: [string, string | null][] = [
    ["Comprador", buyerName],
    ["CPF/CNPJ do comprador", buyerDocument ? formatDocument(buyerDocument) : null],
    ["Vendedor", sellerName],
    ["CPF/CNPJ do vendedor", sellerDocument ? formatDocument(sellerDocument) : null],
    ["Processo judicial", inspectionText(inspection, "judicial_process")],
    ["Vara ou órgão", inspectionText(inspection, "judicial_court")],
    ["Comarca", inspectionText(inspection, "judicial_district")],
  ];

  const fipeValue = inspectionField(inspection, "market_fipe_value");
  if (hasLaudoValue(fipeValue) && typeof fipeValue === "number") {
    rows.push(["Valor FIPE", formatCurrency(fipeValue)]);
  }

  const averageValue = inspectionField(inspection, "market_average_value");
  if (hasLaudoValue(averageValue) && typeof averageValue === "number") {
    rows.push(["Valor médio de mercado", formatCurrency(averageValue)]);
  }

  const insurancePercent = inspectionField(inspection, "insurance_acceptance_percent");
  if (hasLaudoValue(insurancePercent) && typeof insurancePercent === "number") {
    rows.push(["Aceitação do seguro", `${insurancePercent}%`]);
  }

  return buildFilledInfoRows(rows);
}

export function buildVehicleInfoRows(inspection: Inspection): [string, string][] {
  const category = inspectionText(inspection, "vehicle_category");
  const species = inspectionText(inspection, "vehicle_species");
  const categorySpecies =
    [category, species].filter(Boolean).join(" / ") || null;

  const mileage = inspection.mileage;
  const mileageLabel =
    hasLaudoValue(mileage) && typeof mileage === "number" ? formatKM(mileage) : null;

  return buildFilledInfoRows([
    ["Placa", formatPlate(inspection.plate)],
    ["UF do veículo", inspectionText(inspection, "vehicle_uf")],
    ["Chassi", inspection.chassis],
    ["Renavam", hasLaudoValue(inspection.renavam) ? String(inspection.renavam) : null],
    ["Motor", inspectionText(inspection, "motor_number")],
    ["Marca / Modelo", `${inspection.brand} / ${inspection.model}`],
    ["Versão", hasLaudoValue(inspection.version) ? String(inspection.version) : null],
    ["Ano fab./mod.", `${inspection.manufacture_year} / ${inspection.model_year}`],
    ["Cor", inspection.color],
    ["Combustível", inspection.fuel],
    ["Quilometragem", mileageLabel],
    ["Município/UF", inspectionText(inspection, "registration_city_uf")],
    ["Categoria / espécie", categorySpecies],
  ]);
}

export function buildInspectionInfoRows(
  inspection: Inspection,
  company: LaudoPayload["company"],
  inspector: LaudoPayload["inspector"],
  formatDateFn: (date: string) => string,
  formatPhoneFn: (phone: string | null | undefined) => string,
  formatDocumentFn: (doc: string | null | undefined) => string,
): [string, string][] {
  return buildFilledInfoRows([
    ["Empresa", company?.name?.trim() || null],
    ["CPF/CNPJ", company?.document ? formatDocumentFn(company.document) : null],
    ["Telefone", company?.phone ? formatPhoneFn(company.phone) : null],
    ["Endereço", company?.address?.trim() || null],
    [
      "Data e hora",
      `${formatDateFn(inspection.inspection_date)} às ${inspection.inspection_time.slice(0, 5)}`,
    ],
    ["Local da vistoria", inspection.location],
    ["Vistoriador", inspector?.full_name?.trim() || null],
    ["Finalidade", inspectionText(inspection, "inspection_purpose")],
    ["Contratante", inspection.client_name],
    ["Indicado por", inspectionText(inspection, "requester_name")],
  ]);
}
