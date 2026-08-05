import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { draftService, rememberActiveDraftId } from "@/modules/torres-vistoria/draft/services/draft-service";
import { useUser } from "@/core/auth/user-context";
import { requireTenantId, requireUserId } from "@/core/tenant/tenant";
import { ROUTES, withNewInspectionFlow } from "@/config/routes";
import { invalidateInspectionQueries } from "@/infra/query/cache-invalidation";
import type { ActiveDraftSummary } from "@/modules/torres-vistoria/draft/types";

export const draftQueryKeys = {
  active: (tenantId?: string, inspectorId?: string) =>
    ["draft", "active", tenantId, inspectorId] as const,
};

export function useActiveDraft() {
  const { tenantId, userId } = useUser();

  return useQuery({
    queryKey: draftQueryKeys.active(tenantId ?? undefined, userId ?? undefined),
    queryFn: () =>
      draftService.findActiveDraft(requireTenantId(tenantId), requireUserId(userId)),
    enabled: Boolean(tenantId && userId),
    staleTime: 30_000,
  });
}

export function useCreateDraftInspection() {
  const qc = useQueryClient();
  const { tenantId, userId } = useUser();

  return useMutation({
    mutationFn: () =>
      draftService.createEmptyDraft({
        tenantId: requireTenantId(tenantId),
        inspectorId: requireUserId(userId),
      }),
    onSuccess: (inspection) => {
      rememberActiveDraftId(inspection.id);
      invalidateInspectionQueries(qc);
      void qc.invalidateQueries({
        queryKey: draftQueryKeys.active(tenantId ?? undefined, userId ?? undefined),
      });
    },
  });
}

export function useDeleteDraft() {
  const qc = useQueryClient();
  const { tenantId, userId } = useUser();

  return useMutation({
    mutationFn: (id: string) => draftService.deleteDraft(id),
    onSuccess: () => {
      invalidateInspectionQueries(qc);
      void qc.invalidateQueries({
        queryKey: draftQueryKeys.active(tenantId ?? undefined, userId ?? undefined),
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
  const { tenantId, userId } = useUser();

  return useMutation({
    mutationFn: () => draftService.cleanupExpiredDrafts(),
    onSuccess: () => {
      void qc.invalidateQueries({
        queryKey: draftQueryKeys.active(tenantId ?? undefined, userId ?? undefined),
      });
    },
  });
}
