import { useMemo } from "react";
import { useUser } from "@/core/auth/user-context";
import { requireCompanyId, requireUserId } from "@/core/tenant/tenant";
import type { IntegrationContext } from "@/core/integrations/ports/shared";

/** Contexto de integração derivado da sessão do tenant. */
export function useConsultaContext(): IntegrationContext | null {
  const { companyId, userId } = useUser();

  return useMemo(() => {
    if (!companyId || !userId) return null;
    return {
      companyId: requireCompanyId(companyId),
      userId: requireUserId(userId),
    };
  }, [companyId, userId]);
}
