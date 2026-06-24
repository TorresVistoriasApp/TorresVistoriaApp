/** Valor armazenado quando o campo não se aplica ao veículo/cliente. */
export const FIELD_NA_VALUE = "N/A";

export function isFieldNA(value: string | null | undefined): boolean {
  return value === FIELD_NA_VALUE;
}

export function displayFieldValue(
  value: string | null | undefined,
  formatter?: (v: string) => string,
): string {
  if (!value || isFieldNA(value)) return "Não possui";
  return formatter ? formatter(value) : value;
}
