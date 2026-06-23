import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queries";
import {
  inspectionService,
  type InspectionFilters,
} from "@/services/inspection-service";
import type { VistoriaInput } from "@/schemas/vistoria";
import { useAuth } from "@/hooks/use-auth";

export function useInspections(filters?: InspectionFilters) {
  return useQuery({
    queryKey: queryKeys.inspections.list(filters),
    queryFn: () => inspectionService.list(filters),
  });
}

export function useCreateInspection() {
  const qc = useQueryClient();
  const { profile, user } = useAuth();

  return useMutation({
    mutationFn: (input: VistoriaInput) => {
      if (!profile?.company_id || !user?.id) {
        throw new Error("Perfil não carregado");
      }
      return inspectionService.create(input, {
        companyId: profile.company_id,
        inspectorId: user.id,
      });
    },
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.inspections.all });
      void qc.invalidateQueries({ queryKey: queryKeys.dashboard.metrics });
    },
  });
}

export function useUpdateInspection(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<VistoriaInput>) => inspectionService.update(id, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.inspections.detail(id) });
      void qc.invalidateQueries({ queryKey: queryKeys.inspections.all });
    },
  });
}

export function useDeleteInspection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => inspectionService.softDelete(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.inspections.all });
    },
  });
}
