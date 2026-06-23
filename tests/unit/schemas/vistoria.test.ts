import { describe, expect, it } from "vitest";
import { vistoriaSchema } from "@/schemas/vistoria";
import { InspectionSituation, InspectionStatus } from "@/lib/enums";

describe("vistoriaSchema", () => {
  it("valida vistoria mínima", () => {
    const result = vistoriaSchema.safeParse({
      inspection_date: "2026-06-23",
      inspection_time: "14:30",
      location: "São Paulo",
      client_name: "João Silva",
      client_document: "12345678901",
      plate: "ABC1D23",
      chassis: "9BWZZZ377VT004251",
      brand: "Volkswagen",
      model: "Gol",
      color: "Prata",
      fuel: "Flex",
      manufacture_year: 2020,
      model_year: 2021,
      situation: InspectionSituation.PARTICULAR,
      status: InspectionStatus.DRAFT,
    });
    expect(result.success).toBe(true);
  });
});
