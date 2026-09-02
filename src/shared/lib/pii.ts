import { isFieldNA } from "@/shared/lib/field-na";

/**
 * Níveis de PII (Fase D):
 *   1. Completo — só laudo/PDF, captura em formulário e processamento autorizado.
 *   2. Mascarado — padrão da interface.
 *   3. Oculto — listagens admin/auditoria; o valor completo não entra na UI.
 *
 * Criptografia em repouso fica de fora desta fase: matching, PDF e
 * índices ainda precisam do valor original no banco.
 */

function digitsOnly(value: string): string {
  return value.replace(/\D/g, "");
}

function emptyDisplay(value: string | null | undefined): string | null {
  if (value == null) return "—";
  const trimmed = value.trim();
  if (!trimmed) return "—";
  if (isFieldNA(trimmed)) return "Não informado";
  return null;
}

/** CPF mascarado: três asteriscos, bloco do meio visível, DV oculto. */
export function redactCpf(value: string): string {
  const digits = digitsOnly(value);
  if (digits.length !== 11) return "***";
  return `***.${digits.slice(3, 6)}.${digits.slice(6, 9)}-**`;
}

/** CNPJ mascarado: raiz oculta, filial visível, DV oculto. */
export function redactCnpj(value: string): string {
  const digits = digitsOnly(value);
  if (digits.length !== 14) return "***";
  return `**.***.***/${digits.slice(8, 12)}-**`;
}

export function redactDocument(value: string | null | undefined): string {
  const empty = emptyDisplay(value);
  if (empty) return empty;
  const digits = digitsOnly(value!);
  if (digits.length === 11) return redactCpf(digits);
  if (digits.length === 14) return redactCnpj(digits);
  return "***";
}

/** E-mail mascarado: dois primeiros caracteres + asteriscos + domínio. */
export function redactEmail(value: string | null | undefined): string {
  if (!value) return "—";
  const trimmed = value.trim();
  if (!trimmed) return "—";
  const at = trimmed.indexOf("@");
  if (at <= 0 || at === trimmed.length - 1) return "***";
  const local = trimmed.slice(0, at);
  const domain = trimmed.slice(at + 1);
  const keep = local.slice(0, Math.min(2, local.length));
  return `${keep}*****@${domain}`;
}

/** Telefone mascarado: DDD visível, meio oculto, quatro finais visíveis. */
export function redactPhone(value: string | null | undefined): string {
  const empty = emptyDisplay(value);
  if (empty) return empty;
  const digits = digitsOnly(value!);
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 3)}****-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ****-${digits.slice(6)}`;
  }
  return "***";
}

export const PII_MASK_FIELDS = new Set([
  "email",
  "client_email",
  "phone",
  "client_phone",
  "document",
  "client_document",
  "buyer_document",
  "seller_document",
  "cpf",
  "cnpj",
]);

export const PII_HIDDEN_FIELDS = new Set([
  "password",
  "recovery_token",
  "access_token",
  "refresh_token",
  "document_hash",
  "internal_notes",
]);

export function redactKnownPiiValue(field: string, value: unknown): string | null {
  if (PII_HIDDEN_FIELDS.has(field)) return null;
  if (!PII_MASK_FIELDS.has(field)) return null;
  if (value == null || value === "") return "—";
  if (typeof value !== "string") return "—";
  if (value === "[redacted]") return value;
  if (field.includes("email")) return redactEmail(value);
  if (field.includes("phone")) return redactPhone(value);
  return redactDocument(value);
}
