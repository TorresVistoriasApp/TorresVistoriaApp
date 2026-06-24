import { describe, expect, it } from "vitest";
import { buildCompanyAddress, buildCompanyLocation, normalizeCep } from "@/lib/cep";
import { maskCep } from "@/lib/masks";

describe("maskCep", () => {
  it("formata CEP com hífen", () => {
    expect(maskCep("04717003")).toBe("04717-003");
  });
});

describe("normalizeCep", () => {
  it("remove caracteres não numéricos", () => {
    expect(normalizeCep("04717-003")).toBe("04717003");
  });
});

describe("buildCompanyAddress", () => {
  it("monta endereço completo legível", () => {
    const result = buildCompanyAddress({
      name: "Torres",
      document: "",
      address_cep: "04717-003",
      address_street: "Rua Alexandre Dumas",
      address_number: "1200",
      address_complement: "Sala 10",
      address_neighborhood: "Chácara Santo Antônio",
      address_city: "São Paulo",
      address_state: "SP",
    });

    expect(result).toContain("Rua Alexandre Dumas, 1200");
    expect(result).toContain("São Paulo");
    expect(result).toContain("04717-003");
  });
});

describe("buildCompanyLocation", () => {
  it("monta localização resumida", () => {
    expect(
      buildCompanyLocation({
        address_neighborhood: "Centro",
        address_city: "São Paulo",
        address_state: "SP",
      }),
    ).toBe("Centro · São Paulo/SP");
  });
});
