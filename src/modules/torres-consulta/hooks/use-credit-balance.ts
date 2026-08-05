import { useQuery } from "@tanstack/react-query";
import { getIntegration, isIntegrationAvailable } from "@/core/integrations/registry";
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
    queryKey: ["consulta", "credits", context?.companyId ?? ""],
    queryFn: async () => {
      const result = await getIntegration("credits").getBalance(context!);
      return result.ok ? result.data : null;
    },
    enabled: Boolean(context) && available,
  });
}
