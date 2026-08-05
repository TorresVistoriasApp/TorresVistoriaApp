import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/infra/supabase/queries";
import { checklistService, type ChecklistItem } from "@/modules/torres-vistoria/services/checklist-service";
import type { ChecklistItemInput } from "@/modules/torres-vistoria/schemas/checklist";
import { invalidateInspectionQueries } from "@/infra/query/cache-invalidation";
import { useUser } from "@/core/auth/user-context";

export function useInspectionChecklist(inspectionId: string | undefined) {
  const { companyId } = useUser();

  return useQuery({
    queryKey: queryKeys.checklist(inspectionId ?? ""),
    queryFn: async () => {
      if (!companyId) {
        return checklistService.listByInspection(inspectionId!);
      }
      return checklistService.syncWithCatalog(inspectionId!, companyId);
    },
    enabled: Boolean(inspectionId) && Boolean(companyId),
  });
}

export function useUpdateChecklistItem(inspectionId: string) {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      patch,
    }: {
      id: string;
      patch: Partial<Pick<ChecklistItemInput, "status" | "notes">>;
    }) => checklistService.updateItem(id, patch),
    onMutate: async ({ id, patch }) => {
      await qc.cancelQueries({ queryKey: queryKeys.checklist(inspectionId) });
      const previous = qc.getQueryData<ChecklistItem[]>(queryKeys.checklist(inspectionId));

      qc.setQueryData<ChecklistItem[]>(queryKeys.checklist(inspectionId), (items) =>
        (items ?? []).map((item) => (item.id === id ? { ...item, ...patch } : item)),
      );

      return { previous };
    },
    onSuccess: (data) => {
      qc.setQueryData<ChecklistItem[]>(queryKeys.checklist(inspectionId), (items) =>
        (items ?? []).map((item) => (item.id === data.id ? data : item)),
      );
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        qc.setQueryData(queryKeys.checklist(inspectionId), context.previous);
      }
    },
    onSettled: () => {
      void qc.invalidateQueries({ queryKey: queryKeys.checklist(inspectionId) });
      invalidateInspectionQueries(qc, inspectionId);
    },
  });
}
