/** Chassi: 17 caracteres, sem I, O e Q para não confundir com 1 e 0. */
const CHASSIS = /^[A-HJ-NPR-Z0-9]{17}$/;

export type Chassis = string & { readonly __brand: "Chassis" };

export function normalizeChassis(value: string): string {
  return value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
}

export function isValidChassis(value: string): boolean {
  return CHASSIS.test(normalizeChassis(value));
}

/** Oculta o miolo do chassi em listagens — é dado sensível do proprietário. */
export function maskChassisForDisplay(value: string): string {
  const chassis = normalizeChassis(value);
  if (chassis.length < 8) return chassis;
  return `${chassis.slice(0, 4)}${"•".repeat(chassis.length - 8)}${chassis.slice(-4)}`;
}

export function toChassis(value: string): Chassis | null {
  const chassis = normalizeChassis(value);
  return isValidChassis(chassis) ? (chassis as Chassis) : null;
}
