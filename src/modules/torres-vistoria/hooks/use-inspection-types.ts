import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/infra/supabase/queries";
import { useUser } from "@/core/auth/user-context";
import { requireCompanyId } from "@/core/tenant/tenant";
import { inspectionTypeService } from "@/modules/torres-vistoria/services/inspection-type-service";
import type { InspectionTypeInput, InspectionTypeUpdateInput } from "@/modules/torres-vistoria/schemas/inspection-type";
import {
  invalidateDashboardQueries,
  invalidateFinancialQueries,
} from "@/infra/query/cache-invalidation";

export function useInspectionTypes(activeOnly = false) {
  const { companyId } = useUser();

  return useQuery({
    queryKey: queryKeys.inspectionTypes.list(companyId ?? undefined, activeOnly),
    queryFn: () => inspectionTypeService.list(requireCompanyId(companyId), activeOnly),
    enabled: !!companyId,
  });
}

function invalidateAll(qc: ReturnType<typeof useQueryClient>) {
  void qc.invalidateQueries({ queryKey: queryKeys.inspectionTypes.all });
  invalidateFinancialQueries(qc);
  invalidateDashboardQueries(qc);
}

export function useCreateInspectionType() {
  const qc = useQueryClient();
  const { companyId } = useUser();

  return useMutation({
    mutationFn: (input: InspectionTypeInput) =>
      inspectionTypeService.create(input, requireCompanyId(companyId)),
    onSuccess: () => invalidateAll(qc),
  });
}

export function useUpdateInspectionType() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: InspectionTypeUpdateInput }) =>
      inspectionTypeService.update(id, input),
    onSuccess: () => invalidateAll(qc),
  });
}

export function useDeleteInspectionType() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => inspectionTypeService.softDelete(id),
    onSuccess: () => invalidateAll(qc),
  });
}
