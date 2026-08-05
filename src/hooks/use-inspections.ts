import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  inspectionService,
  type InspectionFilters,
} from "@/services/inspection-service";
import type { VistoriaInput } from "@/schemas/vistoria";
import { useUser } from "@/hooks/use-user";
import { useTenantQuery } from "@/hooks/use-tenant-query";
import { requireCompanyId, requireUserId } from "@/lib/tenant";
import {
  invalidateDashboardQueries,
  invalidateFinancialQueries,
  invalidateInspectionQueries,
} from "@/lib/cache-invalidation";
import { InspectionStatus } from "@/lib/enums";

export function useInspections(filters?: InspectionFilters) {
  return useTenantQuery({
    queryKey: ["inspections", "list", filters] as const,
    queryFn: (companyId) => inspectionService.list(companyId, filters),
  });
}

export function useCreateInspection() {
  const qc = useQueryClient();
  const { companyId, userId } = useUser();

  return useMutation({
    mutationFn: (input: VistoriaInput) =>
      inspectionService.create(input, {
        companyId: requireCompanyId(companyId),
        inspectorId: requireUserId(userId),
      }),
    onSuccess: () => {
      invalidateInspectionQueries(qc);
      invalidateDashboardQueries(qc);
      invalidateFinancialQueries(qc);
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
      invalidateFinancialQueries(qc);
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
      invalidateFinancialQueries(qc);
    },
  });
}

export function useArchiveInspection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      inspectionService.update(id, { status: InspectionStatus.ARCHIVED }),
    onSuccess: (_, id) => {
      invalidateInspectionQueries(qc, id);
      invalidateDashboardQueries(qc);
    },
  });
}

export function useUnarchiveInspection() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, opinion }: { id: string; opinion: string | null }) =>
      inspectionService.update(id, {
        status: opinion ? InspectionStatus.COMPLETED : InspectionStatus.DRAFT,
      }),
    onSuccess: (_, { id }) => {
      invalidateInspectionQueries(qc, id);
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

export { useInspection } from "@/hooks/use-inspection-detail";
