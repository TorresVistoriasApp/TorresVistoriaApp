import { describe, expect, it } from "vitest";
import { DRAFT_PLACEHOLDER_VALUES } from "@/features/draft/lib/draft-defaults";
import {
  formatVistoriaFormDefaults,
  prepareVistoriaFormForSave,
} from "@/lib/vistoria-form-defaults";

describe("vistoria-form-defaults", () => {
  it("converte valores sentinela do rascunho em campos vazios para o formulário", () => {
    const result = formatVistoriaFormDefaults({
      location: DRAFT_PLACEHOLDER_VALUES.location,
      client_name: DRAFT_PLACEHOLDER_VALUES.client_name,
      brand: DRAFT_PLACEHOLDER_VALUES.brand,
    });

    expect(result.location).toBe("");
    expect(result.client_name).toBe("");
    expect(result.brand).toBe("");
  });

  it("restaura valores sentinela ao salvar campos vazios", () => {
    const result = prepareVistoriaFormForSave({
      location: "",
      client_name: "  ",
      plate: "ABC1D23",
    });

    expect(result.location).toBe(DRAFT_PLACEHOLDER_VALUES.location);
    expect(result.client_name).toBe(DRAFT_PLACEHOLDER_VALUES.client_name);
    expect(result.plate).toBe("ABC1D23");
  });
});
