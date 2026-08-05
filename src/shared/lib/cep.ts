import { maskCep } from "@/shared/lib/masks";

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
