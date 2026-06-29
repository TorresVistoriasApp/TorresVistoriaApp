import { describe, expect, it } from "vitest";
import { computeInspectionCompletionPercent } from "@/features/draft/lib/completion-percent";
import { InspectionSituation, InspectionStatus } from "@/lib/enums";

describe("computeInspectionCompletionPercent", () => {
  it("retorna 0 para rascunho vazio", () => {
    const percent = computeInspectionCompletionPercent({
      inspection: {
        status: InspectionStatus.DRAFT,
        client_name: "Rascunho em andamento",
        plate: "AAA0A00",
      },
      photos: [],
      checklist: [],
    });

    expect(percent).toBe(0);
  });

  it("aumenta conforme campos, fotos e checklist são preenchidos", () => {
    const percent = computeInspectionCompletionPercent({
      inspection: {
        inspection_date: "2026-06-29",
        inspection_time: "10:00",
        location: "São Paulo",
        inspection_type_id: "00000000-0000-4000-8000-000000000001",
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
        opinion: "APROVADO",
        technical_notes: "Veículo em bom estado geral.",
      },
      photos: [{ id: "1", category: "FRONT", public_url: "x" } as never],
      checklist: [
        { id: "1", status: "CONFORME" } as never,
        { id: "2", status: "PENDENTE" } as never,
      ],
    });

    expect(percent).toBeGreaterThan(40);
    expect(percent).toBeLessThanOrEqual(100);
  });
});
