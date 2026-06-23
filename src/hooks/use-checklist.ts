import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queries";
import { checklistService } from "@/services/checklist-service";
import type { ChecklistItemInput } from "@/schemas/checklist";
import { invalidateInspectionQueries } from "@/lib/cache-invalidation";

export function useInspectionChecklist(inspectionId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.checklist(inspectionId ?? ""),
    queryFn: () => checklistService.listByInspection(inspectionId!),
    enabled: Boolean(inspectionId),
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
    onSuccess: () => {
      invalidateInspectionQueries(qc, inspectionId);
    },
  });
}
