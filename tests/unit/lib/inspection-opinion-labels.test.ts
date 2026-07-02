import { describe, expect, it } from "vitest";
import { InspectionOpinion } from "@/lib/enums";
import {
  getInspectionOpinionLabel,
  isOpinionReproved,
  isOpinionWithObservations,
} from "@/lib/inspection-opinion-labels";

describe("getInspectionOpinionLabel", () => {
  it("usa os rótulos do checklist no PDF", () => {
    expect(getInspectionOpinionLabel(InspectionOpinion.APROVADO)).toBe("Aprovado");
    expect(getInspectionOpinionLabel(InspectionOpinion.APROVADO_COM_OBSERVACOES)).toBe(
      "Aprovado com Apontamentos",
    );
    expect(getInspectionOpinionLabel(InspectionOpinion.REPROVADO)).toBe("Reprovado");
  });

  it("converte rótulos legados do PDF", () => {
    expect(getInspectionOpinionLabel("CONFORME")).toBe("Aprovado");
    expect(getInspectionOpinionLabel("CONFORME COM APONTAMENTO")).toBe("Aprovado com Apontamentos");
  });
});

describe("opinion tone helpers", () => {
  it("identifica parecer com apontamentos", () => {
    expect(isOpinionWithObservations("Aprovado com Apontamentos")).toBe(true);
    expect(isOpinionWithObservations("CONFORME COM APONTAMENTO")).toBe(true);
    expect(isOpinionWithObservations("Aprovado")).toBe(false);
  });

  it("identifica parecer reprovado", () => {
    expect(isOpinionReproved("Reprovado")).toBe(true);
    expect(isOpinionReproved("Aprovado")).toBe(false);
  });
});
