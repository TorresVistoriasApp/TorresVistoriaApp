import { describe, expect, it } from "vitest";
import { getExpectedChecklistCount } from "@/modules/torres-vistoria/domain/checklist/checklist-catalog";
import {
  CHECKLIST_ISSUE_MANUAL_SEPARATOR,
  formatChecklistIssueNotes,
  getChecklistIssueOptions,
  hasChecklistIssueContent,
  listChecklistItemsMissingIssueOptions,
  parseChecklistIssueNotes,
} from "@/modules/torres-vistoria/domain/checklist/checklist-issue-options";

describe("checklist-issue-options", () => {
  it("cobre todos os itens do CHECKLIST_CATALOG", () => {
    expect(listChecklistItemsMissingIssueOptions()).toEqual([]);
  });

  it("oferece entre 3 e 6 opções por item mapeado", () => {
    const counts: number[] = [];
    // Amostra representativa de famílias distintas
    const samples = [
      ["ESTRUTURA", "Longarina dianteira"],
      ["ESTRUTURA", "Assoalho / tanque"],
      ["PINTURA", "Pintura original de fábrica"],
      ["VIDROS", "Para-brisa"],
      ["MECANICA", "Pneus (estado e medida)"],
      ["MECANICA", "Cintos de segurança"],
      ["LATARIA", "Para-choques dianteiro e traseiro"],
      ["DOCUMENTACAO", "Conformidade Renavam × chassi × motor"],
    ] as const;

    for (const [category, name] of samples) {
      const options = getChecklistIssueOptions(category, name);
      counts.push(options.length);
      expect(options.length).toBeGreaterThanOrEqual(3);
      expect(options.length).toBeLessThanOrEqual(6);
      expect(new Set(options.map((o) => o.code)).size).toBe(options.length);
    }

    expect(counts.length).toBe(samples.length);
    expect(getExpectedChecklistCount()).toBeGreaterThan(40);
  });

  it("formata múltiplos apontamentos e observação manual", () => {
    const notes = formatChecklistIssueNotes("ESTRUTURA", "Longarina dianteira", [
      "amassada",
      "reparada",
    ], "Reparo na região central");

    expect(notes).toBe(`Amassada; Reparada${CHECKLIST_ISSUE_MANUAL_SEPARATOR}Reparo na região central`);
  });

  it("formata somente chips ou somente observação manual", () => {
    expect(
      formatChecklistIssueNotes("PINTURA", "Pintura original de fábrica", ["riscada", "repintada"]),
    ).toBe("Riscada; Repintada");

    expect(
      formatChecklistIssueNotes("VIDROS", "Para-brisa", [], "Trinca no canto superior"),
    ).toBe("Trinca no canto superior");

    expect(formatChecklistIssueNotes("VIDROS", "Para-brisa", [])).toBeNull();
  });

  it("faz parse round-trip de chips + observação", () => {
    const category = "LATARIA";
    const item = "Para-choques dianteiro e traseiro";
    const notes = formatChecklistIssueNotes(category, item, ["riscado", "reparado"], "Lado esquerdo");
    const parsed = parseChecklistIssueNotes(category, item, notes);

    expect(parsed.issueCodes).toEqual(["riscado", "reparado"]);
    expect(parsed.manualObservation).toBe("Lado esquerdo");
  });

  it("trata notes legado (texto livre) como observação manual", () => {
    const parsed = parseChecklistIssueNotes(
      "ESTRUTURA",
      "Longarina dianteira",
      "Solda irregular na longarina esquerda",
    );

    expect(parsed.issueCodes).toEqual([]);
    expect(parsed.manualObservation).toBe("Solda irregular na longarina esquerda");
  });

  it("hasChecklistIssueContent valida conteúdo mínimo", () => {
    expect(hasChecklistIssueContent(null)).toBe(false);
    expect(hasChecklistIssueContent("   ")).toBe(false);
    expect(hasChecklistIssueContent("Amassada")).toBe(true);
  });
});
