function laudoYear(issuedAt: Date | string): number {
  if (typeof issuedAt === "string") {
    const match = issuedAt.match(/^(\d{4})/);
    if (match) return Number(match[1]);
    return new Date(issuedAt).getFullYear();
  }
  return issuedAt.getFullYear();
}

/** Número público do laudo exibido no PDF e na página de validação (ex.: TV-2026-000148). */
export function formatLaudoNumber(
  inspectionNumber: number,
  referenceDate: Date | string = new Date(),
): string {
  return `TV-${laudoYear(referenceDate)}-${String(inspectionNumber).padStart(6, "0")}`;
}

/** Código de verificação fixo por vistoria — reemissões mantêm o mesmo valor. */
export function buildVerificationCode(
  inspectionNumber: number,
  referenceDate: Date | string = new Date(),
): string {
  return formatLaudoNumber(inspectionNumber, referenceDate);
}
