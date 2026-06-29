import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { DraftRecoveryModal } from "@/features/draft/components/draft-recovery-modal";
import {
  useActiveDraft,
  useDeleteDraft,
  useDraftCleanup,
  useDraftRecoveryActions,
} from "@/features/draft/hooks/use-draft-recovery";
import { useOfflineSyncEngine } from "@/features/draft/hooks/use-offline-sync";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

export function DraftSystemProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();
  const { toast } = useToast();
  const { data: activeDraft, isLoading } = useActiveDraft();
  const deleteDraft = useDeleteDraft();
  const cleanup = useDraftCleanup();
  const { continueDraft, discardAndStartNew, isBusy } = useDraftRecoveryActions();
  const [dismissed, setDismissed] = useState(false);
  const cleanupRanRef = useRef(false);

  useOfflineSyncEngine();

  useEffect(() => {
    if (!user || cleanupRanRef.current) return;
    cleanupRanRef.current = true;
    cleanup.mutate();
    // Executa limpeza de rascunhos expirados apenas uma vez por sessão.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const shouldOpenModal = useMemo(() => {
    if (isLoading || !activeDraft || dismissed) return false;

    const onWizardRoute =
      location.pathname.includes("/vistorias/") &&
      (location.pathname.includes("/editar") ||
        location.pathname.includes("/fotos") ||
        location.pathname.includes("/checklist") ||
        location.pathname.includes("/laudo") ||
        location.pathname.endsWith("/nova"));

    if (onWizardRoute && location.pathname.includes(activeDraft.id)) {
      return false;
    }

    return true;
  }, [activeDraft, dismissed, isLoading, location.pathname]);

  useEffect(() => {
    setDismissed(false);
  }, [activeDraft?.id]);

  const handleDelete = async () => {
    if (!activeDraft) return;
    try {
      await deleteDraft.mutateAsync(activeDraft.id);
      setDismissed(true);
      toast("Rascunho excluído.");
    } catch (error) {
      toast(error instanceof Error ? error.message : "Erro ao excluir rascunho");
    }
  };

  const handleStartNew = async () => {
    if (!activeDraft) return;
    try {
      await discardAndStartNew(activeDraft);
      setDismissed(true);
    } catch (error) {
      toast(error instanceof Error ? error.message : "Erro ao iniciar nova vistoria");
    }
  };

  return (
    <>
      {children}
      <DraftRecoveryModal
        draft={activeDraft ?? null}
        open={shouldOpenModal}
        onOpenChange={(open) => {
          if (!open) setDismissed(true);
        }}
        onContinue={() => {
          if (!activeDraft) return;
          continueDraft(activeDraft);
          setDismissed(true);
        }}
        onDelete={() => void handleDelete()}
        onStartNew={() => void handleStartNew()}
        isBusy={isBusy || deleteDraft.isPending}
      />
    </>
  );
}
