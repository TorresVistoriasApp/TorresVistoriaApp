/** Paridade com src/shared/lib/env-flag.ts — só "true" literal liga flags. */
export function isEnvFlagTrue(value: string | undefined): boolean {
  return value?.trim() === "true";
}
