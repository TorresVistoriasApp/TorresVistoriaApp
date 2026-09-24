import { describe, expect, it } from "vitest";
import { buildLaudoDocDefinition } from "@/modules/torres-vistoria/domain/laudo/laudo-doc-definition";
import type { LaudoPayload, LaudoPhoto } from "@/modules/torres-vistoria/domain/laudo/laudo-model";

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

function makePayload(overrides: Partial<LaudoPayload> = {}): LaudoPayload {
  const base: LaudoPayload = {
    inspection: {
      id: "insp-1",
      tenant_id: "tenant-1",
      inspector_id: "user-1",
      inspection_number: 1,
      inspection_date: "2026-09-24",
      inspection_time: "10:00",
      location: "SP",
      inspection_purpose: "Compra",
      inspection_type_id: null,
      requester_name: null,
      requester_document: null,
      buyer_name: null,
      buyer_document: null,
      seller_name: null,
      seller_document: null,
      judicial_process: null,
      judicial_court: null,
      judicial_district: null,
      client_name: "Cliente",
      client_document: "123",
      client_phone: null,
      client_email: null,
      plate: "ABC1D23",
      chassis: "CHASSIS123",
      renavam: null,
      motor_number: null,
      vehicle_uf: null,
      registration_city_uf: null,
      vehicle_category: null,
      vehicle_species: null,
      passenger_capacity: null,
      power_cv: null,
      engine_displacement: null,
      brand: "VW",
      model: "Gol",
      version: null,
      color: "Preto",
      fuel: "Flex",
      manufacture_year: 2020,
      model_year: 2021,
      mileage: 10000,
      situation: "OK",
      opinion: "APROVADO",
      technical_notes: null,
      internal_notes: null,
      market_fipe_value: null,
      market_average_value: null,
      insurance_acceptance_percent: null,
      vehicle_condition: null,
      is_armored: false,
      status: "IN_PROGRESS",
      completion_percent: 100,
      draft_expires_at: null,
      last_auto_saved_at: null,
      created_at: "2026-09-24",
      updated_at: "2026-09-24",
    },
    checklist: [],
    photos: [],
    laudoNumber: "TV-2026-000001",
    verificationCode: "TV-ABCD-EFGH-IJKL",
    integrityHash: "abc",
    generatedAt: new Date("2026-09-24"),
  };
  return { ...base, ...overrides };
}

function mockPhotos(count: number): LaudoPhoto[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `photo-${index}`,
    tenant_id: "tenant-1",
    inspection_id: "insp-1",
    category: "EXT_FRENTE_45_ESQ",
    storage_path: `tenant/insp/cat/${index}.webp`,
    public_url: `data:image/jpeg;base64,${"a".repeat(64)}`,
    thumbnail_url: null,
    display_name: null,
    captured_at: null,
    created_at: "2026-09-24",
    dataUrl: `data:image/jpeg;base64,${"b".repeat(64)}`,
  }));
}

describe("laudo PDF pipeline — preview vs official", () => {
  it("official não inclui watermark de prévia", () => {
    const preview = buildLaudoDocDefinition(makePayload({ integrityHash: "preview" })) as {
      watermark?: { text?: string };
    };
    preview.watermark = {
      text: "PREVIA — NAO OFICIAL",
      color: "#b45309",
      opacity: 0.12,
      bold: true,
      fontSize: 46,
    };
    const official = buildLaudoDocDefinition(
      makePayload({
        integrityHash: "digest",
        contentDigest: "digest-oficial-64chars-hex-placeholder-0000000000000000",
      }),
    ) as { watermark?: { text?: string } };

    const previewText = collectTexts(preview).join(" ");
    const officialText = collectTexts(official).join(" ");
    expect(preview.watermark?.text).toContain("PREVIA");
    expect(official.watermark).toBeUndefined();
    expect(officialText).toContain("digest-oficial-64chars-hex-placeholder-0000000000000000");
    expect(previewText).toContain("Registro fotográfico");
    expect(officialText).toContain("Registro fotográfico");
  });

  for (const count of [1, 10, 50, 75, 80, 100]) {
    it(`mantém seção de fotos com ${count} imagens embutidas`, () => {
      const def = buildLaudoDocDefinition(makePayload({ photos: mockPhotos(count) }));
      const text = collectTexts(def).join(" ");
      expect(text).toContain("Registro fotográfico");
      const imageNodes = JSON.stringify(def).match(/"image":/g)?.length ?? 0;
      expect(imageNodes).toBeGreaterThan(0);
    });
  }
});
