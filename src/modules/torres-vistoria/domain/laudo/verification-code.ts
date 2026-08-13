function laudoYear(issuedAt: Date | string): number {
  if (typeof issuedAt === "string") {
    const match = issuedAt.match(/^(\d{4})/);
    if (match) return Number(match[1]);
    return new Date(issuedAt).getFullYear();
  }
  return issuedAt.getFullYear();
}

/** Número público do laudo exibido no PDF (ex.: TV-2026-000148). Não serve para validação. */
export function formatLaudoNumber(
  inspectionNumber: number,
  referenceDate: Date | string = new Date(),
): string {
  return `TV-${laudoYear(referenceDate)}-${String(inspectionNumber).padStart(6, "0")}`;
}

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/**
 * Código de verificação opaco (ex.: TV-K7M2-9XQH-4NWP).
 * Independente do número sequencial da vistoria — evita enumeração pública.
 */
export function buildVerificationCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(12));
  let raw = "";
  for (const byte of bytes) {
    raw += CODE_ALPHABET[byte % CODE_ALPHABET.length];
  }
  return `TV-${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8, 12)}`;
}

/** Código resumido para o rodapé — o código completo permanece na seção de autenticidade. */
export function summarizeVerificationCode(code: string): string {
  const parts = code.split("-");
  if (parts.length < 3) return code;
  return `${parts[0]}-••••-${parts[parts.length - 1]}`;
}
