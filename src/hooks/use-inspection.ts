import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queries";
import { inspectionService } from "@/services/inspection-service";
import { checklistService } from "@/services/checklist-service";
import type { ChecklistItemInput } from "@/schemas/checklist";

export function useInspection(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.inspections.detail(id ?? ""),
    queryFn: () => inspectionService.getById(id!),
    enabled: Boolean(id),
  });
}

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
      void qc.invalidateQueries({ queryKey: queryKeys.checklist(inspectionId) });
    },
  });
}
