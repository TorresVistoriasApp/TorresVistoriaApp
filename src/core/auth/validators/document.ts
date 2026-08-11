import { isValidCnpj, normalizeCnpj } from "@/core/auth/validators/cnpj";
import { isValidCpf, normalizeCpf } from "@/core/auth/validators/cpf";

export type InspectorDocumentType = "cpf" | "cnpj";

export function normalizeInspectorDocument(value: string, type: InspectorDocumentType): string {
  return type === "cpf" ? normalizeCpf(value) : normalizeCnpj(value);
}

export function isValidInspectorDocument(value: string, type: InspectorDocumentType): boolean {
  return type === "cpf" ? isValidCpf(value) : isValidCnpj(value);
}

export function inferDocumentTypeFromDigits(digits: string): InspectorDocumentType | null {
  const normalized = digits.replace(/\D/g, "");
  if (normalized.length <= 11) return "cpf";
  if (normalized.length <= 14) return "cnpj";
  return null;
}
