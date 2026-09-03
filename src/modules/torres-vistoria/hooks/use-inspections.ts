import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  inspectionService,
  type InspectionFilters,
} from "@/modules/torres-vistoria/services/inspection-service";
import type { VistoriaInput } from "@/modules/torres-vistoria/schemas/vistoria";
import { useUser } from "@/core/auth/user-context";
import { useTenantQuery } from "@/core/tenant/use-tenant-query";
import { requireTenantId, requireUserId } from "@/core/tenant/tenant";
import {
  invalidateDashboardQueries,
  invalidateFinancialQueries,
  invalidateInspectionQueries,
} from "@/infra/query/cache-invalidation";
import { InspectionStatus } from "@/modules/torres-vistoria/domain/enums";

export function useInspections(filters?: InspectionFilters) {
  return useTenantQuery({
    queryKey: ["inspections", "list", filters] as const,
    queryFn: (tenantId) => inspectionService.list(tenantId, filters),
  });
}

export function useCreateInspection() {
  const qc = useQueryClient();
  const { tenantId, userId } = useUser();

  return useMutation({
    mutationFn: (input: VistoriaInput) =>
      inspectionService.create(input, {
        tenantId: requireTenantId(tenantId),
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
    mutationFn: ({ inspectionId }: { inspectionId: string }) =>
      inspectionService.generateReport(inspectionId),
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

export { useInspection } from "@/modules/torres-vistoria/hooks/use-inspection-detail";
