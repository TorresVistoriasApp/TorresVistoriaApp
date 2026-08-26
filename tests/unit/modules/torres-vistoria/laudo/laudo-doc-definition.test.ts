import { describe, expect, it } from "vitest";
import { ChecklistStatus, InspectionOpinion } from "@/modules/torres-vistoria/domain/enums";
import { CHECKLIST_CATALOG } from "@/modules/torres-vistoria/domain/checklist/checklist-catalog";
import { formatChecklistIssueNotes } from "@/modules/torres-vistoria/domain/checklist/checklist-issue-options";
import type { ChecklistItem } from "@/modules/torres-vistoria/services/checklist-service";
import type { LaudoPayload, LaudoPhoto } from "@/modules/torres-vistoria/domain/laudo/laudo-model";
import { buildLaudoDocDefinition } from "@/modules/torres-vistoria/domain/laudo/laudo-doc-definition";
import {
  buildLaudoReportViewModel,
  getOpinionTone,
} from "@/modules/torres-vistoria/domain/laudo/pdf/laudo-report-view-model";
import { buildPaintSilhouetteCanvasOps, mapZonePoint, SILHOUETTE_HEIGHT, SILHOUETTE_WIDTH } from "@/modules/torres-vistoria/domain/laudo/pdf/paint-silhouette";
import { getLaudoLegalParagraphs } from "@/modules/torres-vistoria/domain/laudo/laudo-model";

function collectTexts(node: unknown): string[] {
  const texts: string[] = [];

  const walk = (value: unknown) => {
    if (value == null) return;
    if (typeof value === "string") {
      texts.push(value);
      return;
    }
    if (typeof value === "function") return;
    if (Array.isArray(value)) {
      value.forEach(walk);
      return;
    }
    if (typeof value === "object") {
      const record = value as Record<string, unknown>;
      if (typeof record.text === "string") texts.push(record.text);
      else if (Array.isArray(record.text)) walk(record.text);
      for (const [key, nested] of Object.entries(record)) {
        if (key === "text") continue;
        walk(nested);
      }
    }
  };

  walk(node);
  return texts;
}

function makeInspection(overrides: Record<string, unknown> = {}): LaudoPayload["inspection"] {
  return {
    id: "insp-1",
    tenant_id: "tenant-1",
    inspector_id: "inspetor-1",
    inspection_number: 148,
    inspection_date: "2026-08-13",
    inspection_time: "14:30:00",
    location: "São Paulo / SP",
    inspection_purpose: "Transferência",
    client_name: "Cliente Teste",
    client_document: "12345678901",
    plate: "ABC1D23",
    chassis: "9BWZZZ377VT004251",
    renavam: "12345678901",
    brand: "CHERY",
    model: "ARGO",
    color: "PRATA",
    fuel: "FLEX",
    manufacture_year: 2026,
    model_year: 2026,
    opinion: InspectionOpinion.APROVADO,
    technical_notes: "Veículo em conformidade com os itens avaliados.",
    ...overrides,
  } as LaudoPayload["inspection"];
}

function makeItem(overrides: Partial<ChecklistItem> = {}): ChecklistItem {
  return {
    id: "item-1",
    inspection_id: "insp-1",
    tenant_id: "tenant-1",
    category: "ESTRUTURA",
    item_name: "Longarina dianteira",
    status: ChecklistStatus.CONFORME,
    notes: null,
    ...overrides,
  };
}

function makePhoto(id: string, category: string, extras: Partial<LaudoPhoto> = {}): LaudoPhoto {
  return {
    id,
    inspection_id: "insp-1",
    tenant_id: "tenant-1",
    category,
    display_name: extras.display_name ?? category,
    public_url: `https://example.com/${id}.jpg`,
    dataUrl: `data:image/jpeg;base64,${id}`,
    ...extras,
  } as LaudoPhoto;
}

function makePayload(overrides: Partial<LaudoPayload> = {}): LaudoPayload {
  return {
    inspection: makeInspection(),
    checklist: [
      makeItem(),
      makeItem({
        id: "item-2",
        item_name: "Painel dianteiro",
        status: ChecklistStatus.NAO_CONFORME,
        notes: formatChecklistIssueNotes("ESTRUTURA", "Painel dianteiro", ["soldado", "reparado"]),
      }),
    ],
    photos: [],
    laudoNumber: "TV-2026-000148",
    verificationCode: "TV-K7M2-9XQH-4NWP",
    integrityHash: "a".repeat(64),
    validationUrl: "https://app.torres.app/validar/TV-K7M2-9XQH-4NWP",
    generatedAt: new Date("2026-08-13T14:30:00"),
    ...overrides,
  };
}

function catalogChecklist(statusFor: (category: string, name: string) => string): ChecklistItem[] {
  return CHECKLIST_CATALOG.flatMap((category) =>
    category.items.map((item, index) =>
      makeItem({
        id: `${category.key}-${index}`,
        category: category.key,
        item_name: item.name,
        status: statusFor(category.key, item.name),
        notes:
          statusFor(category.key, item.name) === ChecklistStatus.NAO_CONFORME
            ? "Reparo identificado na inspeção."
            : null,
      }),
    ),
  );
}

describe("laudo report view-model", () => {
  it("calcula indicadores e gráficos a partir do checklist real", () => {
    const view = buildLaudoReportViewModel(makePayload());

    expect(view.indicators.map((item) => item.label)).toEqual([
      "Itens avaliados",
      "Aprovados",
      "Apontamentos",
      "Não avaliados",
      "Pendências",
      "Fotografias",
    ]);
    expect(view.indicators[1]?.value).toBe("1");
    expect(view.indicators[2]?.value).toBe("1");
    expect(view.checklistDistribution.find((slice) => slice.label === "Aprovado")?.value).toBe(1);
    expect(view.checklistDistribution.find((slice) => slice.label.includes("Apontamento"))?.value).toBe(1);
    expect(view.apontamentos).toHaveLength(1);
    expect(view.apontamentos[0]?.itemName).toBe("Painel dianteiro");
    expect(view.apontamentos[0]?.note).toContain("Soldado");
  });

  it("não inventa análise de pintura sem dados", () => {
    const view = buildLaudoReportViewModel(makePayload({ checklist: [makeItem()], photos: [] }));
    expect(view.hasPaintAnalysisData).toBe(false);
    expect(view.paintZones.every((zone) => zone.state === "SEM_REGISTRO")).toBe(true);
  });

  it("marca zona com avaria apenas quando há localização fotografada", () => {
    const view = buildLaudoReportViewModel(
      makePayload({
        photos: [
          makePhoto("p1", "PINT_CAPO", {
            display_name: "Capô",
            damage_location: "Capô",
            damage_severity: "Média",
          }),
        ],
      }),
    );

    expect(view.hasPaintAnalysisData).toBe(true);
    expect(view.paintZones.find((zone) => zone.key === "CAPO")?.state).toBe("AVARIA");
    expect(view.damages).toHaveLength(1);
  });

  it("usa tom neutro para parecer pendente", () => {
    expect(getOpinionTone("Pendente")).toBe("neutral");
    expect(getOpinionTone("Reprovado")).toBe("danger");
    expect(getOpinionTone("Aprovado com Apontamentos")).toBe("warning");
    expect(getOpinionTone("Aprovado")).toBe("success");
  });
});

describe("buildLaudoDocDefinition", () => {
  it("preserva hash, código de autenticidade e dados do veículo", () => {
    const payload = makePayload();
    const def = buildLaudoDocDefinition(payload);
    const text = collectTexts(def).join(" | ");

    expect(text).toContain(payload.integrityHash);
    expect(text).toContain(payload.verificationCode);
    expect(text).toContain(payload.laudoNumber);
    expect(text).toContain("CHERY / ARGO");
    expect(text).toContain("FLEX");
    expect(text).toContain("PRATA");
    expect(text).toContain("Painel dianteiro");
    expect(text).toContain("Soldado");
    expect(text).toContain("Veículo em conformidade com os itens avaliados.");
    expect(def.pageSize).toBe("A4");
  });

  it("gera PDF sem fotos sem inventar registro fotográfico", () => {
    const def = buildLaudoDocDefinition(makePayload({ photos: [] }));
    const text = collectTexts(def).join(" | ");

    expect(text).toContain("Nenhuma foto registrada para esta vistoria.");
    expect(text).toContain("Nenhuma fotografia foi anexada ao registro desta vistoria.");
  });

  it("adapta o layout a poucas e a muitas fotos", () => {
    const few = buildLaudoDocDefinition(
      makePayload({
        photos: [
          makePhoto("1", "EXT_FRENTE_45_ESQ", { display_name: "Frente 45° esquerda" }),
          makePhoto("2", "EXT_FRENTE_45_DIR", { display_name: "Frente 45° direita" }),
        ],
      }),
    );
    const manyPhotos = [
      makePhoto("1", "EXT_FRENTE_45_ESQ", { display_name: "Frente 45° esquerda" }),
      makePhoto("2", "EXT_FRENTE_45_DIR", { display_name: "Frente 45° direita" }),
      makePhoto("3", "EXT_LATERAL_ESQ", { display_name: "Lateral esquerda" }),
      makePhoto("4", "EXT_LATERAL_DIR", { display_name: "Lateral direita" }),
      makePhoto("5", "EXT_TETO", { display_name: "Teto / pintura" }),
      makePhoto("6", "MOT_COMPARTIMENTO", { display_name: "Compartimento do motor" }),
      makePhoto("7", "DOC_VEICULO", { display_name: "Documento do veículo" }),
      makePhoto("8", "IDV_NUMERO_CHASSI", { display_name: "Chassi" }),
    ];
    const many = buildLaudoDocDefinition(makePayload({ photos: manyPhotos }));

    expect(collectTexts(few).join(" | ")).toContain("FRENTE 45° ESQUERDA");
    expect(collectTexts(many).join(" | ")).toContain("LATERAL ESQUERDA");
    expect(collectTexts(many).join(" | ")).toContain("COMPARTIMENTO DO MOTOR");
    expect(JSON.stringify(many).length).toBeGreaterThan(JSON.stringify(few).length);
  });

  it("mantém checklist completo, com apontamentos, aprovado e reprovado", () => {
    const complete = catalogChecklist(() => ChecklistStatus.CONFORME);
    const withNotes = catalogChecklist((category, name) =>
      name === "Painel dianteiro" ? ChecklistStatus.NAO_CONFORME : ChecklistStatus.CONFORME,
    );
    const approved = makePayload({
      checklist: complete,
      inspection: makeInspection({ opinion: InspectionOpinion.APROVADO }),
    });
    const reproved = makePayload({
      checklist: withNotes,
      inspection: makeInspection({
        opinion: InspectionOpinion.REPROVADO,
        technical_notes: "Reprovado em razão de reparo estrutural no painel dianteiro.",
      }),
    });

    const approvedText = collectTexts(buildLaudoDocDefinition(approved)).join(" | ");
    const reprovedText = collectTexts(buildLaudoDocDefinition(reproved)).join(" | ");

    expect(approvedText).toContain("ESTRUTURA E LONGARINAS");
    expect(approvedText).toContain("PINTURA E ACABAMENTO");
    expect(approvedText).toContain("Longarina dianteira");
    expect(approvedText).toContain("ITEM");
    expect(approvedText).toContain("STATUS");
    expect(approvedText).toContain("OBSERVAÇÃO");
    expect(reprovedText).toContain("REPROVADO");
    expect(reprovedText).toContain("Painel dianteiro");
    expect(reprovedText).toContain("Reparo identificado na inspeção.");
    expect(complete).toHaveLength(CHECKLIST_CATALOG.reduce((sum, category) => sum + category.items.length, 0));
  });

  it("preserva parecer curto e parecer longo sem alterar o texto", () => {
    const shortNotes = "Aprovado.";
    const longNotes = `${"A vistoria identificou conformidade estrutural. ".repeat(40)}Fim do parecer.`;

    const shortText = collectTexts(
      buildLaudoDocDefinition(
        makePayload({ inspection: makeInspection({ technical_notes: shortNotes }) }),
      ),
    ).join(" | ");
    const longText = collectTexts(
      buildLaudoDocDefinition(
        makePayload({ inspection: makeInspection({ technical_notes: longNotes }) }),
      ),
    ).join(" | ");

    expect(shortText).toContain(shortNotes);
    expect(longText).toContain("Fim do parecer.");
    expect(longText).toContain(longNotes);
  });

  it("mantém o informativo jurídico integral", () => {
    const text = collectTexts(buildLaudoDocDefinition(makePayload())).join(" | ");
    for (const paragraph of getLaudoLegalParagraphs()) {
      expect(text).toContain(paragraph);
    }
  });

  it("é função pura do payload — o mesmo hash reaparece sem recálculo", () => {
    const payload = makePayload({ integrityHash: "deadbeef".repeat(8) });
    const first = collectTexts(buildLaudoDocDefinition(payload)).join(" | ");
    const second = collectTexts(buildLaudoDocDefinition(payload)).join(" | ");

    expect(first).toContain("deadbeef".repeat(8));
    expect(second).toBe(first);
  });

  it("inclui QR e seção de autenticidade com URL de validação", () => {
    const def = buildLaudoDocDefinition(makePayload()) as {
      content: Array<Record<string, unknown>>;
    };
    const serialized = JSON.stringify(def);

    expect(serialized).toContain('"qr":"https://app.torres.app/validar/TV-K7M2-9XQH-4NWP"');
    expect(collectTexts(def).join(" | ")).toContain("Autenticidade do laudo");
    expect(collectTexts(def).join(" | ")).toContain("CÓDIGO DE AUTENTICIDADE");
  });

  it("usa layouts nomeados que sobrevivem ao clone JSON do gerador", () => {
    const def = buildLaudoDocDefinition(
      makePayload({
        photos: [makePhoto("1", "EXT_FRENTE_45_ESQ", { display_name: "Frente 45° esquerda" })],
      }),
    );
    const cloned = JSON.parse(JSON.stringify(def)) as unknown;
    const layouts: unknown[] = [];

    const walk = (value: unknown) => {
      if (value == null || typeof value === "function") return;
      if (Array.isArray(value)) {
        value.forEach(walk);
        return;
      }
      if (typeof value === "object") {
        const record = value as Record<string, unknown>;
        if ("layout" in record) layouts.push(record.layout);
        Object.values(record).forEach(walk);
      }
    };

    walk(cloned);

    expect(layouts.length).toBeGreaterThan(0);
    expect(layouts.every((layout) => typeof layout === "string")).toBe(true);
    expect(layouts).toContain("laudoData");
    expect(layouts).toContain("laudoNone");
  });
});

describe("paint silhouette", () => {
  it("desenha indicadores apenas para as zonas informadas", () => {
    const ops = buildPaintSilhouetteCanvasOps([
      { key: "CAPO", label: "Capô", state: "AVARIA", x: 0.5, y: 0.22, detail: "1 avaria" },
      { key: "TETO", label: "Teto", state: "REGISTRADA", x: 0.5, y: 0.66 },
    ]);

    const dots = ops.filter((op) => op.type === "ellipse" && op.color);
    expect(dots.length).toBeGreaterThanOrEqual(2);
  });

  it("posiciona o ponto central do teto no meio da ilustração", () => {
    const point = mapZonePoint({ x: 0.5, y: 0.66 });
    expect(point.x).toBeCloseTo(SILHOUETTE_WIDTH * 0.5);
    expect(point.y).toBeCloseTo(SILHOUETTE_HEIGHT * 0.66);
  });

  it("sobrepõe os pontos na ilustração quando a imagem está no payload", () => {
    const def = buildLaudoDocDefinition(
      makePayload({
        vehicleTopViewDataUrl: "data:image/webp;base64,AAAA",
        photos: [
          makePhoto("p1", "PINT_CAPO", {
            display_name: "Capô",
            damage_location: "Capô",
            damage_severity: "Média",
          }),
        ],
      }),
    );
    const serialized = JSON.stringify(def);
    expect(serialized).toContain("data:image/webp;base64,AAAA");
    expect(serialized).toContain("Análise de pintura e estrutura");
  });
});
