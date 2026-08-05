/**
 * Normalização e validação de placa e chassi.
 *
 * A placa aceita os dois padrões em circulação no Brasil: o antigo
 * (`ABC1234`) e o Mercosul (`ABC1D23`), que difere pelo quinto caractere ser
 * uma letra.
 */

const LEGACY_PLATE = /^[A-Z]{3}[0-9]{4}$/;
const MERCOSUL_PLATE = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/;

/** Chassi: 17 caracteres, sem I, O e Q para não confundir com 1 e 0. */
const CHASSIS = /^[A-HJ-NPR-Z0-9]{17}$/;

/** Remove separadores e uniformiza para maiúsculas. */
export function normalizePlate(value: string): string {
  return value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
}

export function normalizeChassis(value: string): string {
  return value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
}

export function isValidPlate(value: string): boolean {
  const plate = normalizePlate(value);
  return LEGACY_PLATE.test(plate) || MERCOSUL_PLATE.test(plate);
}

export function isMercosulPlate(value: string): boolean {
  return MERCOSUL_PLATE.test(normalizePlate(value));
}

export function isValidChassis(value: string): boolean {
  return CHASSIS.test(normalizeChassis(value));
}

/** Formata para exibição: `ABC-1234` no padrão antigo, `ABC1D23` no Mercosul. */
export function formatPlate(value: string): string {
  const plate = normalizePlate(value);
  if (LEGACY_PLATE.test(plate)) return `${plate.slice(0, 3)}-${plate.slice(3)}`;
  return plate;
}

/** Oculta o miolo do chassi em listagens — é dado sensível do proprietário. */
export function maskChassisForDisplay(value: string): string {
  const chassis = normalizeChassis(value);
  if (chassis.length < 8) return chassis;
  return `${chassis.slice(0, 4)}${"•".repeat(chassis.length - 8)}${chassis.slice(-4)}`;
}
