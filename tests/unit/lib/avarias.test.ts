import { describe, expect, it } from "vitest";
import {
  buildDamageCaptureMetadata,
  buildDamageDisplayName,
  formatDamagePhotoCaption,
  isDamageCaptureFormValid,
  validateDamageCaptureForm,
} from "@/lib/photos/avarias";

describe("avarias", () => {
  const validForm = {
    location: "Para-choque dianteiro",
    customLocation: "",
    category: "Amassado",
    customCategory: "",
    severity: "MODERADA" as const,
    description: "Pintura riscada próxima ao friso",
  };

  it("valida formulário completo", () => {
    expect(isDamageCaptureFormValid(validForm)).toBe(true);
    expect(validateDamageCaptureForm(validForm)).toEqual({});
  });

  it("exige localização, categoria e grau", () => {
    const errors = validateDamageCaptureForm({
      location: "",
      customLocation: "",
      category: "",
      customCategory: "",
      severity: "LEVE",
      description: "",
    });

    expect(errors.location).toBeTruthy();
    expect(errors.category).toBeTruthy();
  });

  it("monta display name e metadados de captura", () => {
    expect(buildDamageDisplayName(validForm, 2)).toBe(
      "Avaria 2 · Amassado — Para-choque dianteiro",
    );

    expect(buildDamageCaptureMetadata(validForm, 2)).toEqual({
      sectionKey: "AVARIAS",
      displayName: "Avaria 2 · Amassado — Para-choque dianteiro",
      damageLocation: "Para-choque dianteiro",
      damageCategory: "Amassado",
      damageSeverity: "MODERADA",
      complementaryName: "Pintura riscada próxima ao friso",
    });
  });

  it("formata legenda com descrição complementar", () => {
    expect(
      formatDamagePhotoCaption({
        damage_category: "Amassado",
        damage_location: "Capô",
        damage_severity: "LEVE",
        complementary_name: "Sem repintura aparente",
      }),
    ).toBe("Amassado · Capô · Leve — Sem repintura aparente");
  });
});
