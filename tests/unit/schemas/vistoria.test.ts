import { describe, expect, it } from "vitest";
import { vistoriaSchema } from "@/schemas/vistoria";
import { InspectionSituation, InspectionStatus } from "@/lib/enums";
import { FIELD_NA_VALUE } from "@/lib/field-na";

const basePayload = {
  inspection_date: "2026-06-23",
  inspection_time: "14:30",
  location: "São Paulo",
  inspection_type_id: "11111111-1111-4111-8111-111111111111",
  client_name: "João Silva",
  client_document: "123.456.789-01",
  plate: "ABC-1D23",
  chassis: "9BWZZZ377VT004251",
  brand: "Volkswagen",
  model: "Gol",
  color: "Prata",
  fuel: "Flex",
  manufacture_year: 2020,
  model_year: 2021,
  situation: InspectionSituation.PARTICULAR,
  status: InspectionStatus.DRAFT,
  opinion: "APROVADO",
  technical_notes: "Veículo em bom estado geral, sem apontamentos relevantes.",
};

describe("vistoriaSchema", () => {
  it("valida vistoria mínima com máscaras", () => {
    const result = vistoriaSchema.safeParse(basePayload);
    expect(result.success).toBe(true);
  });

  it("exige parecer e observações técnicas", () => {
    const missingOpinion = vistoriaSchema.safeParse({
      ...basePayload,
      opinion: "",
      technical_notes: "",
    });
    expect(missingOpinion.success).toBe(false);
  });

  it("aceita campos marcados como não possui", () => {
    const result = vistoriaSchema.safeParse({
      ...basePayload,
      client_phone: FIELD_NA_VALUE,
      client_email: FIELD_NA_VALUE,
      renavam: FIELD_NA_VALUE,
      version: FIELD_NA_VALUE,
    });
    expect(result.success).toBe(true);
  });

  it("aceita campos numéricos opcionais em branco", () => {
    const result = vistoriaSchema.safeParse({
      ...basePayload,
      market_fipe_value: "",
      market_average_value: "",
      insurance_acceptance_percent: "",
    });

    expect(result.success).toBe(true);
    expect(result.data?.market_fipe_value).toBeNull();
    expect(result.data?.market_average_value).toBeNull();
    expect(result.data?.insurance_acceptance_percent).toBeNull();
  });

  it("converte valor FIPE formatado em real para número", () => {
    const result = vistoriaSchema.safeParse({
      ...basePayload,
      market_fipe_value: "R$ 78.000",
    });

    expect(result.success).toBe(true);
    expect(result.data?.market_fipe_value).toBe(78000);
  });
});
