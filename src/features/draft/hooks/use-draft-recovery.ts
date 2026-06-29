import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { draftService, rememberActiveDraftId } from "@/features/draft/services/draft-service";
import { useAuth } from "@/hooks/use-auth";
import { ROUTES, withNewInspectionFlow } from "@/lib/constants";
import { invalidateInspectionQueries } from "@/lib/cache-invalidation";
import type { ActiveDraftSummary } from "@/features/draft/types";

export const draftQueryKeys = {
  active: (companyId?: string, inspectorId?: string) =>
    ["draft", "active", companyId, inspectorId] as const,
};

export function useActiveDraft() {
  const { profile, user } = useAuth();

  return useQuery({
    queryKey: draftQueryKeys.active(profile?.company_id, user?.id),
    queryFn: () =>
      draftService.findActiveDraft(profile!.company_id, user!.id),
    enabled: Boolean(profile?.company_id && user?.id),
    staleTime: 30_000,
  });
}

export function useCreateDraftInspection() {
  const qc = useQueryClient();
  const { profile, user } = useAuth();

  return useMutation({
    mutationFn: () => {
      if (!profile?.company_id || !user?.id) {
        throw new Error("Perfil não carregado");
      }
      return draftService.createEmptyDraft({
        companyId: profile.company_id,
        inspectorId: user.id,
      });
    },
    onSuccess: (inspection) => {
      rememberActiveDraftId(inspection.id);
      invalidateInspectionQueries(qc);
      void qc.invalidateQueries({
        queryKey: draftQueryKeys.active(profile?.company_id, user?.id),
      });
    },
  });
}

export function useDeleteDraft() {
  const qc = useQueryClient();
  const { profile, user } = useAuth();

  return useMutation({
    mutationFn: (id: string) => draftService.deleteDraft(id),
    onSuccess: () => {
      invalidateInspectionQueries(qc);
      void qc.invalidateQueries({
        queryKey: draftQueryKeys.active(profile?.company_id, user?.id),
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
    navigate(withNewInspectionFlow(ROUTES.inspectionEdit(draft.id)));
  };

  const discardAndStartNew = async (draft: ActiveDraftSummary) => {
    await deleteDraft.mutateAsync(draft.id);
    const inspection = await createDraft.mutateAsync();
    navigate(withNewInspectionFlow(ROUTES.inspectionEdit(inspection.id)), { replace: true });
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
  const { profile, user } = useAuth();

  return useMutation({
    mutationFn: () => draftService.cleanupExpiredDrafts(),
    onSuccess: () => {
      void qc.invalidateQueries({
        queryKey: draftQueryKeys.active(profile?.company_id, user?.id),
      });
    },
  });
}
