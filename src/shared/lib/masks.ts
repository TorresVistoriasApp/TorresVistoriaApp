/** Máscara de CEP brasileiro (00000-000). */
export function maskCep(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export function maskCpfCnpj(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 14);
  if (digits.length <= 11) {
    return digits
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }
  return digits
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
}

/** Máscara de telefone celular ou fixo brasileiro. */
export function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 10) {
    return digits
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4})(\d{1,4})$/, "$1-$2");
  }
  return digits
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d{1,4})$/, "$1-$2");
}

/** Máscara de placa Mercosul ou antiga (ABC-1D23). */
export function maskPlate(value: string): string {
  const cleaned = value.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 7);
  if (cleaned.length <= 3) return cleaned;
  return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
}

/** Máscara de Renavam (até 11 dígitos). */
export function maskRenavam(value: string): string {
  return value.replace(/\D/g, "").slice(0, 11);
}

/** Máscara de quilometragem com separador de milhar. */
export function maskKm(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 7);
  if (!digits) return "";
  return new Intl.NumberFormat("pt-BR").format(Number(digits));
}

/** Máscara monetária em Real para valores inteiros, como FIPE. */
export function maskCurrency(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 12);
  if (!digits) return "";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  })
    .format(Number(digits))
    .replace(/\u00a0/g, " ");
}

/** Máscara monetária em Real com centavos (cada dígito avança os centavos). */
export function maskCurrencyDecimal(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 12);
  if (!digits) return "";
  const amount = Number(digits) / 100;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  })
    .format(amount)
    .replace(/\u00a0/g, " ");
}

/** Converte moeda mascarada com centavos para número. */
export function parseCurrencyDecimal(value: string): number | null {
  const digits = value.replace(/\D/g, "");
  if (!digits) return null;
  return Number(digits) / 100;
}

/** Converte moeda brasileira formatada para número. */
export function parseCurrency(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (trimmed.includes(",")) {
    const normalized = trimmed
      .replace(/[^\d,.-]/g, "")
      .replace(/\./g, "")
      .replace(",", ".");
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }

  const digits = trimmed.replace(/\D/g, "");
  if (!digits) return null;
  return Number(digits);
}

/** Normaliza chassi: maiúsculas, sem I/O/Q, máx. 17 caracteres. */
export function maskChassis(value: string): string {
  return value
    .replace(/[^A-Za-z0-9]/g, "")
    .toUpperCase()
    .replace(/[IOQ]/g, "")
    .slice(0, 17);
}

export type MaskType = "cpfCnpj" | "phone" | "plate" | "renavam" | "km" | "currency" | "chassis" | "cep";

const maskFns: Record<MaskType, (value: string) => string> = {
  cpfCnpj: maskCpfCnpj,
  phone: maskPhone,
  plate: maskPlate,
  renavam: maskRenavam,
  km: maskKm,
  currency: maskCurrency,
  chassis: maskChassis,
  cep: maskCep,
};

export function applyMask(type: MaskType, value: string): string {
  return maskFns[type](value);
}

/** Remove formatação, preservando letras para placa/chassi. */
export function unmaskValue(type: MaskType, value: string): string {
  if (type === "plate" || type === "chassis") {
    return value.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  }
  if (type === "km" || type === "currency") {
    return value.replace(/\D/g, "");
  }
  return value.replace(/\D/g, "");
}
