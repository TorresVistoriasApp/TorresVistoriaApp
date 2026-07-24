import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queries";
import { financialService } from "@/services/financial-service";
import type { FinancialEntryInput } from "@/schemas/financial";
import { useAuth } from "@/hooks/use-auth";
import { invalidateFinancialQueries } from "@/lib/cache-invalidation";
import { hasPermission } from "@/lib/rbac";
import type { UserRole } from "@/lib/enums";

export function useFinancialEntries() {
  const { profile } = useAuth();
  return useQuery({
    queryKey: queryKeys.financial.all,
    queryFn: () => financialService.list(profile?.company_id),
    enabled: !!profile?.company_id,
  });
}

export function useFinancialSummary(startDate?: string, endDate?: string) {
  const { profile } = useAuth();
  // get_financial_summary é restrita a super admin no banco; sem esta guarda a
  // consulta dispararia e falharia antes do RequirePermission renderizar.
  const canRead = hasPermission(profile?.role as UserRole | undefined, "financial.manage");

  return useQuery({
    queryKey: queryKeys.financial.summary(startDate, endDate),
    queryFn: () => financialService.getSummary(profile!.company_id, startDate, endDate),
    enabled: !!profile?.company_id && canRead,
  });
}

export function useCreateFinancialEntry() {
  const qc = useQueryClient();
  const { profile, user } = useAuth();

  return useMutation({
    mutationFn: (input: FinancialEntryInput) => {
      if (!profile?.company_id || !user?.id) throw new Error("Sessão inválida");
      return financialService.create(input, {
        companyId: profile.company_id,
        userId: user.id,
      });
    },
    onSuccess: () => {
      invalidateFinancialQueries(qc);
    },
  });
}
