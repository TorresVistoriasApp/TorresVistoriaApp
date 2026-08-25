import { describe, expect, it } from "vitest";
import { PHOTO_CAPTURE_SECTIONS } from "@/modules/torres-vistoria/domain/photos/photo-catalog";
import {
  createPhotoCaptureContext,
  getVisibleSectionCategories,
  getVisibleSubsections,
  resolveIsArmoredFromInspection,
} from "@/modules/torres-vistoria/domain/photos/photo-capture-visibility";

describe("resolveIsArmoredFromInspection", () => {
  it("retorna true quando is_armored está marcado", () => {
    expect(resolveIsArmoredFromInspection({ is_armored: true })).toBe(true);
  });

  it("detecta blindagem em vehicle_condition", () => {
    expect(resolveIsArmoredFromInspection({ vehicle_condition: "Veículo blindado nível III" })).toBe(
      true,
    );
  });

  it("retorna false para veículo convencional", () => {
    expect(resolveIsArmoredFromInspection({ vehicle_condition: "Seminovo" })).toBe(false);
  });
});

describe("subseções condicionais em FOTOS_EXTRAS", () => {
  const extrasSection = PHOTO_CAPTURE_SECTIONS.find((section) => section.key === "FOTOS_EXTRAS")!;

  it("possui subseções de itens opcionais e blindagem", () => {
    expect(extrasSection.subsections?.map((group) => group.key)).toEqual([
      "EXTRAS_ITENS",
      "EXTRAS_BLINDAGEM",
    ]);
  });

  it("oculta blindagem quando o veículo não é blindado", () => {
    const context = createPhotoCaptureContext({ vehicle_condition: "Usado" });
    const subsections = getVisibleSubsections(extrasSection, context);

    expect(subsections.map((group) => group.key)).toEqual(["EXTRAS_ITENS"]);
    expect(getVisibleSectionCategories(extrasSection, context).some((c) => c.key.startsWith("BLIND_"))).toBe(
      false,
    );
  });

  it("exibe blindagem quando o veículo é blindado", () => {
    const context = createPhotoCaptureContext({ is_armored: true });
    const subsections = getVisibleSubsections(extrasSection, context);

    expect(subsections.map((group) => group.key)).toEqual(["EXTRAS_ITENS", "EXTRAS_BLINDAGEM"]);
    expect(getVisibleSectionCategories(extrasSection, context).some((c) => c.key === "BLIND_VIDRO_DIANT_ESQ")).toBe(
      true,
    );
  });
});

describe("subseções em QUADROS_PORTAS", () => {
  const quadrosSection = PHOTO_CAPTURE_SECTIONS.find((section) => section.key === "QUADROS_PORTAS")!;

  it("possui orientação e subseções de portas e teste de pintura", () => {
    expect(quadrosSection.guidance).toContain("borracha de vedação");
    expect(quadrosSection.subsections?.map((group) => group.key)).toEqual([
      "QDP_PORTAS",
      "QDP_TESTE_PINTURA",
    ]);
    expect(quadrosSection.subsections?.[0]?.guidance).toContain("borracha de vedação");
    expect(quadrosSection.subsections?.[1]?.guidance).toContain("caneta teste");
  });
});
