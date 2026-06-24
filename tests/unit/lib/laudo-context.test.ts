import { describe, expect, it } from "vitest";
import { companyToLaudoCompany, inspectorToLaudoInspector } from "@/lib/laudo/laudo-context";
import type { Company } from "@/services/company-service";

describe("companyToLaudoCompany", () => {
  it("monta dados da empresa a partir das configurações", () => {
    const company: Company = {
      id: "1",
      name: "Torres Vistorias LTDA",
      document: "12345678000199",
      email: null,
      phone: null,
      logo_url: null,
      location: null,
      address: null,
      address_cep: "04717-003",
      address_street: "Rua Alexandre Dumas",
      address_number: "1200",
      address_complement: "Sala 10",
      address_neighborhood: "Chácara Santo Antônio",
      address_city: "São Paulo",
      address_state: "SP",
    };

    const result = companyToLaudoCompany(company);

    expect(result?.name).toBe("Torres Vistorias LTDA");
    expect(result?.document).toBe("12345678000199");
    expect(result?.address).toContain("Rua Alexandre Dumas");
    expect(result?.address).toContain("São Paulo");
  });
});

describe("inspectorToLaudoInspector", () => {
  it("usa o nome do vistoriador da vistoria", () => {
    expect(
      inspectorToLaudoInspector({ full_name: "Brendow Lucas", role: "VISTORIADOR" }),
    ).toEqual({
      full_name: "Brendow Lucas",
      role: "VISTORIADOR",
      credential: "VISTORIADOR",
    });
  });
});
