import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queries";
import { financialService } from "@/services/financial-service";
import type { FinancialEntryInput } from "@/schemas/financial";
import { useAuth } from "@/hooks/use-auth";

export function useFinancialEntries() {
  const { profile } = useAuth();
  return useQuery({
    queryKey: queryKeys.financial.all,
    queryFn: () => financialService.list(profile?.company_id),
  });
}

export function useFinancialSummary() {
  return useQuery({
    queryKey: queryKeys.financial.summary,
    queryFn: () => financialService.getSummary(),
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
      void qc.invalidateQueries({ queryKey: queryKeys.financial.all });
      void qc.invalidateQueries({ queryKey: queryKeys.financial.summary });
      void qc.invalidateQueries({ queryKey: queryKeys.dashboard.metrics });
    },
  });
}
