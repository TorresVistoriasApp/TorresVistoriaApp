import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queries";
import { checklistService, type ChecklistItem } from "@/services/checklist-service";
import type { ChecklistItemInput } from "@/schemas/checklist";
import { invalidateInspectionQueries } from "@/lib/cache-invalidation";
import { useAuth } from "@/hooks/use-auth";

export function useInspectionChecklist(inspectionId: string | undefined) {
  const { profile } = useAuth();

  return useQuery({
    queryKey: queryKeys.checklist(inspectionId ?? ""),
    queryFn: async () => {
      if (!profile?.company_id) {
        return checklistService.listByInspection(inspectionId!);
      }
      return checklistService.syncWithCatalog(inspectionId!, profile.company_id);
    },
    enabled: Boolean(inspectionId) && Boolean(profile?.company_id),
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
