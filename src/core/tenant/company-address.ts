import type { CompanyInput } from "@/core/tenant/schemas/company";

/**
 * Composição do endereço da empresa para exibição e para o laudo.
 *
 * Fica em `core/tenant` porque depende do formato do cadastro da empresa; a
 * busca de CEP em si é genérica e permanece em `shared/lib/cep`.
 */

export function buildCompanyLocation(
  input: Pick<CompanyInput, "address_neighborhood" | "address_city" | "address_state">,
): string | null {
  const cityState =
    input.address_city && input.address_state
      ? `${input.address_city}/${input.address_state}`
      : input.address_city ?? input.address_state ?? "";

  const parts = [input.address_neighborhood, cityState].filter(Boolean);
  return parts.length ? parts.join(" · ") : null;
}

export function buildCompanyAddress(input: CompanyInput): string | null {
  const streetLine = [input.address_street, input.address_number].filter(Boolean).join(", ");
  const locality = [input.address_neighborhood, input.address_city, input.address_state]
    .filter(Boolean)
    .join(" · ");
  const cep = input.address_cep ? `CEP ${input.address_cep}` : "";

  const parts = [streetLine, input.address_complement, locality, cep].filter(Boolean);
  return parts.length ? parts.join(", ") : null;
}

export function companyToAddressInput(company: {
  address_cep?: string | null;
  address_street?: string | null;
  address_number?: string | null;
  address_complement?: string | null;
  address_neighborhood?: string | null;
  address_city?: string | null;
  address_state?: string | null;
}): Pick<
  CompanyInput,
  | "address_cep"
  | "address_street"
  | "address_number"
  | "address_complement"
  | "address_neighborhood"
  | "address_city"
  | "address_state"
> {
  return {
    address_cep: company.address_cep ?? "",
    address_street: company.address_street ?? "",
    address_number: company.address_number ?? "",
    address_complement: company.address_complement ?? "",
    address_neighborhood: company.address_neighborhood ?? "",
    address_city: company.address_city ?? "",
    address_state: company.address_state ?? "",
  };
}
