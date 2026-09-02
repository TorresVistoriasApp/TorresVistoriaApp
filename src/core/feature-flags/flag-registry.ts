import type { FeatureFlag } from "@/core/feature-flags/types";

/**
 * Valores padrão em produção.
 *
 * Overrides por ambiente usam `VITE_FF_<FLAG>` com `_` no lugar de `.` e `-`
 * (ex.: `VITE_FF_TORRES_CONSULTA=false`).
 */
export const DEFAULT_FLAGS: Record<FeatureFlag, boolean> = {
  "torres-consulta": true,
  "torres-consulta.official-api": false,
  "torres-vistoria": true,
  payments: false,
  cashback: false,
  coupons: false,
};

function envKeyFor(flag: FeatureFlag): string {
  return `VITE_FF_${flag.replace(/[.-]/g, "_").toUpperCase()}`;
}

function parseBool(raw: string | undefined): boolean | undefined {
  if (raw === undefined || raw === "") return undefined;
  const value = raw.trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(value)) return true;
  if (["0", "false", "no", "off"].includes(value)) return false;
  return undefined;
}

/** Lê override de env para uma flag, se existir. */
export function envOverride(flag: FeatureFlag): boolean | undefined {
  const key = envKeyFor(flag);
  const fromVite = (import.meta.env as Record<string, string | undefined>)[key];
  return parseBool(fromVite);
}

const runtimeOverrides = new Map<FeatureFlag, boolean>();

/** Override em runtime (testes). */
export function setFlagOverride(flag: FeatureFlag, enabled: boolean): void {
  runtimeOverrides.set(flag, enabled);
}

export function clearFlagOverrides(): void {
  runtimeOverrides.clear();
}

export function runtimeOverride(flag: FeatureFlag): boolean | undefined {
  return runtimeOverrides.get(flag);
}
