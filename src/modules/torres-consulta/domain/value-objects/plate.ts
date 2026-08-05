const LEGACY_PLATE = /^[A-Z]{3}[0-9]{4}$/;
const MERCOSUL_PLATE = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/;

export type Plate = string & { readonly __brand: "Plate" };

export function normalizePlate(value: string): string {
  return value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
}

export function isValidPlate(value: string): boolean {
  const plate = normalizePlate(value);
  return LEGACY_PLATE.test(plate) || MERCOSUL_PLATE.test(plate);
}

export function isMercosulPlate(value: string): boolean {
  return MERCOSUL_PLATE.test(normalizePlate(value));
}

/** Formata para exibição: `ABC-1234` no padrão antigo, `ABC1D23` no Mercosul. */
export function formatPlate(value: string): string {
  const plate = normalizePlate(value);
  if (LEGACY_PLATE.test(plate)) return `${plate.slice(0, 3)}-${plate.slice(3)}`;
  return plate;
}

export function toPlate(value: string): Plate | null {
  const plate = normalizePlate(value);
  return isValidPlate(plate) ? (plate as Plate) : null;
}
