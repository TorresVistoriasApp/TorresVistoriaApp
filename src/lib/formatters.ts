import { isFieldNA } from "@/lib/field-na";

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "-";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(typeof date === "string" ? new Date(date) : date);
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return "-";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(typeof date === "string" ? new Date(date) : date);
}

export function formatCurrency(value: number | null | undefined): string {
  if (value == null) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatNumber(value: number | null | undefined): string {
  if (value == null) return "0";
  return new Intl.NumberFormat("pt-BR").format(value);
}

export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return "-";
  if (isFieldNA(phone)) return "Não informado";
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }
  return phone;
}

export function formatCPF(cpf: string | null | undefined): string {
  if (!cpf) return "-";
  const cleaned = cpf.replace(/\D/g, "");
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  }
  return cpf;
}

export function formatCNPJ(cnpj: string | null | undefined): string {
  if (!cnpj) return "-";
  const cleaned = cnpj.replace(/\D/g, "");
  if (cleaned.length === 14) {
    return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  }
  return cnpj;
}

/** Formata CPF ou CNPJ conforme o tamanho do documento. */
export function formatDocument(doc: string | null | undefined): string {
  if (!doc) return "-";
  if (isFieldNA(doc)) return "Não informado";
  const digits = doc.replace(/\D/g, "");
  if (digits.length === 11) return formatCPF(digits);
  if (digits.length === 14) return formatCNPJ(digits);
  return doc;
}

/** Retorna o rótulo do documento conforme CPF, CNPJ ou genérico. */
export function getDocumentTypeLabel(doc: string | null | undefined): "CPF" | "CNPJ" | "CPF/CNPJ" {
  if (!doc) return "CPF/CNPJ";
  const digits = doc.replace(/\D/g, "");
  if (digits.length === 11) return "CPF";
  if (digits.length === 14) return "CNPJ";
  return "CPF/CNPJ";
}

export function formatPlate(plate: string | null | undefined): string {
  if (!plate) return "-";
  const cleaned = plate.replace(/[^A-Z0-9]/gi, "").toUpperCase();
  if (cleaned.length === 7) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
  }
  return plate.toUpperCase();
}

export function formatKM(km: number | null | undefined): string {
  if (km == null) return "-";
  return `${new Intl.NumberFormat("pt-BR").format(km)} km`;
}

export function truncateText(text: string | null | undefined, maxLength: number): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}
