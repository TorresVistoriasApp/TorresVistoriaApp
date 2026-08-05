import { useMemo } from "react";
import { useUser } from "@/core/auth/user-context";
import { requireTenantId, requireUserId } from "@/core/tenant/tenant";
import type { IntegrationContext } from "@/core/integrations/ports/shared";

/** Contexto de integração derivado da sessão do tenant. */
export function useConsultaContext(): IntegrationContext | null {
  const { tenantId, userId } = useUser();

  return useMemo(() => {
    if (!tenantId || !userId) return null;
    return {
      tenantId: requireTenantId(tenantId),
      userId: requireUserId(userId),
    };
  }, [tenantId, userId]);
}
