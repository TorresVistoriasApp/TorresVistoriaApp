import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queries";
import { useAuth } from "@/hooks/use-auth";
import { inspectionTypeService } from "@/services/inspection-type-service";
import type { InspectionTypeInput, InspectionTypeUpdateInput } from "@/schemas/inspection-type";
import {
  invalidateDashboardQueries,
  invalidateFinancialQueries,
} from "@/lib/cache-invalidation";

export function useInspectionTypes(activeOnly = false) {
  const { profile } = useAuth();
  return useQuery({
    queryKey: queryKeys.inspectionTypes.list(profile?.company_id, activeOnly),
    queryFn: () => inspectionTypeService.list(profile!.company_id, activeOnly),
    enabled: !!profile?.company_id,
  });
}

function invalidateAll(qc: ReturnType<typeof useQueryClient>) {
  void qc.invalidateQueries({ queryKey: queryKeys.inspectionTypes.all });
  invalidateFinancialQueries(qc);
  invalidateDashboardQueries(qc);
}

export function useCreateInspectionType() {
  const qc = useQueryClient();
  const { profile } = useAuth();

  return useMutation({
    mutationFn: (input: InspectionTypeInput) => {
      if (!profile?.company_id) throw new Error("Empresa não encontrada");
      return inspectionTypeService.create(input, profile.company_id);
    },
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
