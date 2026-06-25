import type { CompanyInput } from "@/schemas/settings";
import { maskCep } from "@/lib/masks";

type ViaCepResponse = {
  cep?: string;
  logradouro?: string;
  complemento?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean;
};

export type CepAddress = {
  cep: string;
  street: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
};

export function normalizeCep(value: string): string {
  return value.replace(/\D/g, "").slice(0, 8);
}

export async function fetchAddressByCep(cep: string): Promise<CepAddress | null> {
  const digits = normalizeCep(cep);
  if (digits.length !== 8) return null;

  const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
  if (!response.ok) {
    throw new Error("Não foi possível consultar o CEP. Tente novamente.");
  }

  const data = (await response.json()) as ViaCepResponse;
  if (data.erro) return null;

  return {
    cep: maskCep(data.cep ?? digits),
    street: data.logradouro?.trim() ?? "",
    complement: data.complemento?.trim() ?? "",
    neighborhood: data.bairro?.trim() ?? "",
    city: data.localidade?.trim() ?? "",
    state: data.uf?.trim().toUpperCase() ?? "",
  };
}

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
