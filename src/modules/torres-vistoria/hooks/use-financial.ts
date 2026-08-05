import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/infra/supabase/queries";
import { financialService } from "@/modules/torres-vistoria/services/financial-service";
import type { FinancialEntryInput } from "@/modules/torres-vistoria/schemas/financial";
import { usePermission } from "@/core/rbac/use-permission";
import { useUser } from "@/core/auth/user-context";
import { invalidateFinancialQueries } from "@/infra/query/cache-invalidation";

export function useFinancialEntries(page = 1, pageSize = 50) {
  const { tenantId } = useUser();
  const { can } = usePermission();
  const canRead = can("financial.manage") || can("financial.read.own");
  const offset = (page - 1) * pageSize;
  return useQuery({
    queryKey: queryKeys.financial.list(tenantId ?? undefined, page, pageSize),
    queryFn: () => financialService.list(tenantId!, pageSize, offset),
    enabled: !!tenantId && canRead,
  });
}

export function useFinancialSummary(startDate?: string, endDate?: string) {
  const { tenantId } = useUser();
  const { can } = usePermission();
  const canRead = can("financial.manage") || can("financial.read.own");

  return useQuery({
    queryKey: queryKeys.financial.summary(tenantId ?? undefined, startDate, endDate),
    queryFn: () => financialService.getSummary(tenantId!, startDate, endDate),
    enabled: !!tenantId && canRead,
  });
}

export function useCreateFinancialEntry() {
  const qc = useQueryClient();
  const { userId, tenantId } = useUser();

  return useMutation({
    mutationFn: (input: FinancialEntryInput) => {
      if (!tenantId || !userId) throw new Error("Sessão inválida");
      return financialService.create(input, {
        tenantId,
        userId,
      });
    },
    onSuccess: () => {
      invalidateFinancialQueries(qc);
    },
  });
}
