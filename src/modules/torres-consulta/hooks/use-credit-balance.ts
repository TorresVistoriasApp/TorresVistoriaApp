import { useQuery } from "@tanstack/react-query";
import { isIntegrationAvailable } from "@/core/integrations/registry";
import { cacheKeys } from "@/core/cache";
import { getCreditBalance } from "@/modules/torres-consulta/application/use-cases";
import { useConsultaContext } from "@/modules/torres-consulta/hooks/use-consulta-context";
import type { CreditBalance } from "@/core/integrations/ports/credit-ledger";

/**
 * Saldo de créditos do tenant.
 *
 * Devolve `null` quando não há adaptador de créditos: a ausência de integração é
 * um estado previsto da UI, não um erro de carregamento.
 */
export function useCreditBalance() {
  const context = useConsultaContext();
  const available = isIntegrationAvailable("credits");

  return useQuery<CreditBalance | null>({
    queryKey: cacheKeys.consulta.credits(context?.tenantId ?? ""),
    queryFn: () => getCreditBalance(context!),
    enabled: Boolean(context) && available,
  });
}
