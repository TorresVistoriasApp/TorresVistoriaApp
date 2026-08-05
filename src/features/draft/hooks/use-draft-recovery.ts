import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { draftService, rememberActiveDraftId } from "@/features/draft/services/draft-service";
import { useUser } from "@/hooks/use-user";
import { requireCompanyId, requireUserId } from "@/lib/tenant";
import { ROUTES, withNewInspectionFlow } from "@/lib/constants";
import { invalidateInspectionQueries } from "@/lib/cache-invalidation";
import type { ActiveDraftSummary } from "@/features/draft/types";

export const draftQueryKeys = {
  active: (companyId?: string, inspectorId?: string) =>
    ["draft", "active", companyId, inspectorId] as const,
};

export function useActiveDraft() {
  const { companyId, userId } = useUser();

  return useQuery({
    queryKey: draftQueryKeys.active(companyId ?? undefined, userId ?? undefined),
    queryFn: () =>
      draftService.findActiveDraft(requireCompanyId(companyId), requireUserId(userId)),
    enabled: Boolean(companyId && userId),
    staleTime: 30_000,
  });
}

export function useCreateDraftInspection() {
  const qc = useQueryClient();
  const { companyId, userId } = useUser();

  return useMutation({
    mutationFn: () =>
      draftService.createEmptyDraft({
        companyId: requireCompanyId(companyId),
        inspectorId: requireUserId(userId),
      }),
    onSuccess: (inspection) => {
      rememberActiveDraftId(inspection.id);
      invalidateInspectionQueries(qc);
      void qc.invalidateQueries({
        queryKey: draftQueryKeys.active(companyId ?? undefined, userId ?? undefined),
      });
    },
  });
}

export function useDeleteDraft() {
  const qc = useQueryClient();
  const { companyId, userId } = useUser();

  return useMutation({
    mutationFn: (id: string) => draftService.deleteDraft(id),
    onSuccess: () => {
      invalidateInspectionQueries(qc);
      void qc.invalidateQueries({
        queryKey: draftQueryKeys.active(companyId ?? undefined, userId ?? undefined),
      });
    },
  });
}

export function useDraftRecoveryActions() {
  const navigate = useNavigate();
  const deleteDraft = useDeleteDraft();
  const createDraft = useCreateDraftInspection();

  const continueDraft = (draft: ActiveDraftSummary) => {
    rememberActiveDraftId(draft.id);
    navigate(withNewInspectionFlow(ROUTES.inspectionPhotos(draft.id)));
  };

  const discardAndStartNew = async (draft: ActiveDraftSummary) => {
    await deleteDraft.mutateAsync(draft.id);
    const inspection = await createDraft.mutateAsync();
    navigate(withNewInspectionFlow(ROUTES.inspectionPhotos(inspection.id)), { replace: true });
  };

  return {
    continueDraft,
    discardAndStartNew,
    deleteDraft,
    createDraft,
    isBusy: deleteDraft.isPending || createDraft.isPending,
  };
}

export function useDraftCleanup() {
  const qc = useQueryClient();
  const { companyId, userId } = useUser();

  return useMutation({
    mutationFn: () => draftService.cleanupExpiredDrafts(),
    onSuccess: () => {
      void qc.invalidateQueries({
        queryKey: draftQueryKeys.active(companyId ?? undefined, userId ?? undefined),
      });
    },
  });
}
