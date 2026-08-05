import { registerIntegration } from "@/core/integrations/registry";
import { supabaseFileStorage } from "@/infra/integrations/storage";

/**
 * Vincula os adaptadores disponíveis às portas de integração.
 *
 * Cada domínio vive em `infra/integrations/<domínio>/`. Só o que estiver
 * pronto é registrado — o restante permanece indisponível de propósito.
 */
export function bootstrapIntegrations(): void {
  registerIntegration("storage", supabaseFileStorage);

  // Domínios com pasta pronta, sem adaptador ainda:
  //   vehicle/   → vehicleLookup
  //   payment/   → payments
  //   email/     → email
  //   pdf/       → pdf
  //   credits/   → credits
}
