import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queries";
import {
  inspectionService,
  type InspectionFilters,
} from "@/services/inspection-service";
import type { VistoriaInput } from "@/schemas/vistoria";
import { useAuth } from "@/hooks/use-auth";
import { invalidateDashboardQueries, invalidateInspectionQueries } from "@/lib/cache-invalidation";

export function useInspections(filters?: InspectionFilters) {
  return useQuery({
    queryKey: queryKeys.inspections.list(filters),
    queryFn: () => inspectionService.list(filters),
  });
}

export function useSearchInspections(params?: InspectionFilters) {
  const { profile } = useAuth();
  return useQuery({
    queryKey: queryKeys.inspections.search(params),
    queryFn: () => inspectionService.search(profile!.company_id, params),
    enabled: !!profile?.company_id,
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
      invalidateInspectionQueries(qc);
      invalidateDashboardQueries(qc);
    },
  });
}

export function useUpdateInspection(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<VistoriaInput>) => inspectionService.update(id, input),
    onSuccess: () => {
      invalidateInspectionQueries(qc, id);
      invalidateDashboardQueries(qc);
    },
  });
}

export function useDeleteInspection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => inspectionService.softDelete(id),
    onSuccess: () => {
      invalidateInspectionQueries(qc);
      invalidateDashboardQueries(qc);
    },
  });
}

export function useGenerateReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ inspectionId, storagePath }: { inspectionId: string; storagePath?: string }) =>
      inspectionService.generateReport(inspectionId, storagePath),
    onSuccess: (_, { inspectionId }) => {
      invalidateInspectionQueries(qc, inspectionId);
      invalidateDashboardQueries(qc);
    },
  });
}

export function useValidateReport() {
  return useMutation({
    mutationFn: (verificationCode: string) => inspectionService.validateReport(verificationCode),
  });
}
