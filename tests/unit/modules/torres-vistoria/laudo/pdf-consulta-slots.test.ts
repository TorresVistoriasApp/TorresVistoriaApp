import { describe, expect, it } from "vitest";
import { buildConsultaSections, listConsultaSlotDefaults } from "@/modules/torres-vistoria/domain/laudo/pdf/pdf-consulta-slots";
import { buildLaudoDocDefinition } from "@/modules/torres-vistoria/domain/laudo/laudo-doc-definition";
import { ChecklistStatus, InspectionOpinion } from "@/modules/torres-vistoria/domain/enums";
import type { LaudoPayload } from "@/modules/torres-vistoria/domain/laudo/laudo-model";

function collectTexts(node: unknown): string[] {
  const texts: string[] = [];
  const walk = (value: unknown) => {
    if (value == null || typeof value === "function") return;
    if (typeof value === "string") {
      texts.push(value);
      return;
    }
    if (Array.isArray(value)) {
      value.forEach(walk);
      return;
    }
    if (typeof value === "object") {
      const record = value as Record<string, unknown>;
      if (typeof record.text === "string") texts.push(record.text);
      Object.entries(record).forEach(([key, nested]) => {
        if (key !== "text") walk(nested);
      });
    }
  };
  walk(node);
  return texts;
}

function makePayload(): LaudoPayload {
  return {
    inspection: {
      id: "1",
      tenant_id: "t",
      inspector_id: "i",
      inspection_number: 1,
      inspection_date: "2026-08-13",
      inspection_time: "15:09:00",
      location: "BH",
      plate: "ABC1D23",
      chassis: "9BD",
      brand: "FIAT",
      model: "ARGO",
      color: "BRANCO",
      fuel: "FLEX",
      manufacture_year: 2019,
      model_year: 2020,
      opinion: InspectionOpinion.APROVADO,
      technical_notes: "Ok.",
      vehicle_origin: "Brasil",
    } as LaudoPayload["inspection"],
    checklist: [
      {
        id: "1",
        inspection_id: "1",
        tenant_id: "t",
        category: "ESTRUTURA",
        item_name: "Longarina",
        status: ChecklistStatus.CONFORME,
        notes: null,
      },
    ],
    photos: [],
    laudoNumber: "TV-2026-000001",
    verificationCode: "TV-AAAA-BBBB-CCCC",
    integrityHash: "a".repeat(64),
    generatedAt: new Date(),
  };
}

describe("consulta slots", () => {
  it("não renderiza slots vazios", () => {
    expect(buildConsultaSections([])).toEqual([]);
    expect(
      buildConsultaSections([{ key: "leilao", title: "Leilão", subtitle: "x", icon: "market" }]),
    ).toEqual([]);
  });

  it("renderiza slot apenas com dados reais", () => {
    const nodes = buildConsultaSections([
      {
        key: "sinistro",
        title: "Indício de sinistro",
        subtitle: "Consulta",
        icon: "damage",
        rows: [["Situação", "Nada consta"]],
      },
    ]);
    expect(nodes.length).toBe(1);
    expect(JSON.stringify(nodes)).toContain("Nada consta");
  });

  it("expõe catálogo de slots futuros", () => {
    expect(Object.keys(listConsultaSlotDefaults())).toContain("leilao");
    expect(Object.keys(listConsultaSlotDefaults())).toContain("gravame");
  });
});

describe("premium editorial layout", () => {
  it("usa intro + barra colorida em vez de rail vertical", () => {
    const def = buildLaudoDocDefinition(makePayload());
    const text = collectTexts(def).join(" | ");
    expect(text).toContain("Dados do veículo");
    expect(text).toContain("DETALHES");
    expect(text).toContain("BRASIL");
    expect(JSON.stringify(def)).toContain("laudoPremiumSection");
  });
});
