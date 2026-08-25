import { describe, expect, it } from "vitest";
import {
  CHECKLIST_ISSUE_MANUAL_SEPARATOR,
  formatChecklistIssueNotes,
  formatChecklistObservationForPdf,
  parseChecklistIssueNotes,
} from "@/modules/torres-vistoria/domain/checklist/checklist-issue-options";
import { ChecklistStatus } from "@/modules/torres-vistoria/domain/enums";
import { getChecklistStatusPdfLabel } from "@/modules/torres-vistoria/domain/checklist/checklist-status";
import { validateChecklistCompletion } from "@/modules/torres-vistoria/components/forms/checklist-form";
import type { ChecklistItem } from "@/modules/torres-vistoria/services/checklist-service";

function makeItem(overrides: Partial<ChecklistItem> = {}): ChecklistItem {
  return {
    id: "1",
    inspection_id: "insp",
    tenant_id: "tenant",
    category: "ESTRUTURA",
    item_name: "Longarina dianteira",
    status: ChecklistStatus.PENDENTE,
    notes: null,
    ...overrides,
  };
}

describe("checklist apontamentos no laudo PDF", () => {
  it("Aprovado aparece com label correto e sem observação inventada", () => {
    expect(getChecklistStatusPdfLabel(ChecklistStatus.CONFORME)).toBe("Aprovado");
    expect(formatChecklistObservationForPdf(ChecklistStatus.CONFORME, null)).toBe("");
    expect(formatChecklistObservationForPdf(ChecklistStatus.CONFORME, "   ")).toBe("");
  });

  it("Aprovado com apontamento aparece com label e apontamentos", () => {
    expect(getChecklistStatusPdfLabel(ChecklistStatus.NAO_CONFORME)).toBe(
      "Aprovado com Apontamentos",
    );

    const notes = formatChecklistIssueNotes("ESTRUTURA", "Longarina dianteira", [
      "amassada",
      "reparada",
    ]);
    expect(notes).toBe("Amassada; Reparada");
    expect(formatChecklistObservationForPdf(ChecklistStatus.NAO_CONFORME, notes)).toBe(
      "Amassada; Reparada",
    );
  });

  it("múltiplos apontamentos e observação manual aparecem no texto do PDF", () => {
    const notes = formatChecklistIssueNotes(
      "PINTURA",
      "Pintura original de fábrica",
      ["amassada", "repintada"],
      "Reparo na região central",
    );

    expect(notes).toBe(
      `Amassada; Repintada${CHECKLIST_ISSUE_MANUAL_SEPARATOR}Reparo na região central`,
    );
    expect(formatChecklistObservationForPdf(ChecklistStatus.NAO_CONFORME, notes)).toContain(
      "Amassada; Repintada",
    );
    expect(formatChecklistObservationForPdf(ChecklistStatus.NAO_CONFORME, notes)).toContain(
      "Reparo na região central",
    );
  });

  it("Não avaliado aparece corretamente sem observação vazia", () => {
    expect(getChecklistStatusPdfLabel(ChecklistStatus.NA)).toBe("Não Avaliado");
    expect(formatChecklistObservationForPdf(ChecklistStatus.NA, null)).toBe("");
  });

  it("campos sem apontamento não geram placeholder no PDF", () => {
    expect(formatChecklistObservationForPdf(ChecklistStatus.CONFORME, null)).not.toMatch(
      /sem observação/i,
    );
    expect(formatChecklistObservationForPdf(ChecklistStatus.NA, undefined)).not.toMatch(
      /sem observação/i,
    );
  });

  it("validação exige apontamento rápido ou observação manual", () => {
    const incomplete = [
      makeItem({ status: ChecklistStatus.CONFORME }),
      makeItem({
        id: "2",
        status: ChecklistStatus.NAO_CONFORME,
        notes: null,
      }),
    ];
    expect(validateChecklistCompletion(incomplete).valid).toBe(false);
    expect(validateChecklistCompletion(incomplete).missingNotesCount).toBe(1);

    const withChips = [
      makeItem({ status: ChecklistStatus.CONFORME }),
      makeItem({
        id: "2",
        status: ChecklistStatus.NAO_CONFORME,
        notes: "Amassada; Reparada",
      }),
      makeItem({ id: "3", status: ChecklistStatus.NA }),
    ];
    expect(validateChecklistCompletion(withChips).valid).toBe(true);

    const withManualOnly = [
      makeItem({
        status: ChecklistStatus.NAO_CONFORME,
        notes: "Solda irregular na longarina",
      }),
    ];
    expect(validateChecklistCompletion(withManualOnly).valid).toBe(true);
  });

  it("parse preserva apontamentos gravados ao reabrir a vistoria", () => {
    const notes = formatChecklistIssueNotes("MECANICA", "Pneus (estado e medida)", [
      "desgastado",
      "medida_divergente",
    ], "Dianteiro esquerdo");

    const parsed = parseChecklistIssueNotes("MECANICA", "Pneus (estado e medida)", notes);
    expect(parsed.issueCodes).toEqual(["desgastado", "medida_divergente"]);
    expect(parsed.manualObservation).toBe("Dianteiro esquerdo");
  });
});
