import { isIntegrationAvailable } from "@/core/integrations/registry";

/** Motivos de indisponibilidade que a UI trata como estado, não como erro. */
export const ConsultaUnavailableReason = {
  PROVIDER: "PROVIDER",
} as const;
export type ConsultaUnavailableReason =
  (typeof ConsultaUnavailableReason)[keyof typeof ConsultaUnavailableReason];

/** Integrações que faltam para o módulo operar. Vazio significa pronto. */
export function missingIntegrations(): ConsultaUnavailableReason[] {
  const missing: ConsultaUnavailableReason[] = [];
  if (!isIntegrationAvailable("vehicleLookup")) missing.push(ConsultaUnavailableReason.PROVIDER);
  return missing;
}

export function isConsultaAvailable(): boolean {
  return missingIntegrations().length === 0;
}
