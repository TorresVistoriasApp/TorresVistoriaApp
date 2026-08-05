import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queries";
import { platformCompanyService } from "@/services/platform-company-service";
import { useAuth } from "@/hooks/use-auth";
import type { OnboardCompanyInput } from "@/schemas/platform-admin";

export function usePlatformCompanies() {
  const { isPlatformAdmin } = useAuth();

  return useQuery({
    queryKey: queryKeys.platformCompanies.all,
    queryFn: () => platformCompanyService.list(),
    enabled: isPlatformAdmin,
  });
}

export function useOnboardCompany() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (input: OnboardCompanyInput) => platformCompanyService.onboard(input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.platformCompanies.all });
    },
  });
}
