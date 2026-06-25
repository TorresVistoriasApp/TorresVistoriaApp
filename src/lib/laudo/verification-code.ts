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
  issuedAt: Date | string = new Date(),
): string {
  return `TV-${laudoYear(issuedAt)}-${String(inspectionNumber).padStart(6, "0")}`;
}

/** Código único de verificação usado na URL do QR Code. */
export function buildVerificationCode(
  inspectionNumber: number,
  issuedAt: Date | string = new Date(),
  version = 1,
): string {
  const base = formatLaudoNumber(inspectionNumber, issuedAt);
  return version > 1 ? `${base}-V${version}` : base;
}
