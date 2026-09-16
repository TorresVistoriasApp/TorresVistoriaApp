/**
 * Flags de ambiente estritas: só a string literal "true" (após trim) liga o comportamento.
 * Valores como TRUE, 1, yes permanecem desligados — evita fail-open acidental em produção.
 */
export function isEnvFlagTrue(value: string | undefined): boolean {
  return value?.trim() === "true";
}
