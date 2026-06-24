/** Aplica máscara de CPF (11 dígitos) ou CNPJ (14 dígitos) conforme o tamanho. */
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

/** Normaliza chassi: maiúsculas, sem I/O/Q, máx. 17 caracteres. */
export function maskChassis(value: string): string {
  return value
    .replace(/[^A-Za-z0-9]/g, "")
    .toUpperCase()
    .replace(/[IOQ]/g, "")
    .slice(0, 17);
}

export type MaskType = "cpfCnpj" | "phone" | "plate" | "renavam" | "km" | "chassis";

const maskFns: Record<MaskType, (value: string) => string> = {
  cpfCnpj: maskCpfCnpj,
  phone: maskPhone,
  plate: maskPlate,
  renavam: maskRenavam,
  km: maskKm,
  chassis: maskChassis,
};

export function applyMask(type: MaskType, value: string): string {
  return maskFns[type](value);
}

/** Remove formatação, preservando letras para placa/chassi. */
export function unmaskValue(type: MaskType, value: string): string {
  if (type === "plate" || type === "chassis") {
    return value.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  }
  if (type === "km") {
    return value.replace(/\D/g, "");
  }
  return value.replace(/\D/g, "");
}
