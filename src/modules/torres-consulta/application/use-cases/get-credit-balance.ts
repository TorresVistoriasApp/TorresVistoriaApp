import { getIntegration, isIntegrationAvailable } from "@/core/integrations/registry";
import type { IntegrationContext } from "@/core/integrations/ports/shared";
import type { CreditBalance } from "@/core/integrations/ports/credit-ledger";

/**
 * Saldo de créditos do tenant.
 *
 * Devolve `null` quando não há adaptador — ausência é estado previsto da UI.
 */
export async function getCreditBalance(
  context: IntegrationContext,
): Promise<CreditBalance | null> {
  if (!isIntegrationAvailable("credits")) return null;
  const result = await getIntegration("credits").getBalance(context);
  return result.ok ? result.data : null;
}
