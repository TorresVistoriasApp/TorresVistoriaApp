import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { DraftRecoveryModal } from "@/modules/torres-vistoria/draft/components/draft-recovery-modal";
import {
  useActiveDraft,
  useDeleteDraft,
  useDraftCleanup,
  useDraftRecoveryActions,
} from "@/modules/torres-vistoria/draft/hooks/use-draft-recovery";
import { useOfflineSyncEngine } from "@/modules/torres-vistoria/draft/hooks/use-offline-sync";
import { useAuth } from "@/core/auth/use-auth";
import { registerSessionCleanup } from "@/core/auth/session-cleanup";
import { offlineStore } from "@/modules/torres-vistoria/draft/lib/offline-store";
import { clearActiveDraftLocalState } from "@/modules/torres-vistoria/draft/services/draft-service";
import { useToast } from "@/shared/hooks/use-toast";
import { ROUTES, ROUTE_SLUGS } from "@/config/routes";

export function DraftSystemProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();
  const { toast } = useToast();
  const { data: activeDraft, isLoading } = useActiveDraft();
  const deleteDraft = useDeleteDraft();
  const cleanup = useDraftCleanup();
  const { continueDraft, isBusy } = useDraftRecoveryActions();
  const [dismissed, setDismissed] = useState(false);
  const cleanupRanRef = useRef(false);

  useOfflineSyncEngine();

  // Rascunhos ficam em IndexedDB e localStorage: o logout precisa apagá-los
  // para não vazar dados de vistoria entre usuários do mesmo dispositivo.
  useEffect(
    () =>
      registerSessionCleanup(async () => {
        clearActiveDraftLocalState();
        await offlineStore.clearAll();
      }),
    [],
  );

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
      location.pathname.includes(`/${ROUTE_SLUGS.inspections}/`) &&
      (location.pathname.includes(`/${ROUTE_SLUGS.edit}`) ||
        location.pathname.includes(`/${ROUTE_SLUGS.photos}`) ||
        location.pathname.includes(`/${ROUTE_SLUGS.checklist}`) ||
        location.pathname.includes(`/${ROUTE_SLUGS.report}`) ||
        location.pathname.endsWith(`/${ROUTE_SLUGS.new}`));

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
      // Descarta o draft atual e abre o fluxo canônico de nova vistoria.
      await deleteDraft.mutateAsync(activeDraft.id);
      setDismissed(true);
      window.location.assign(ROUTES.inspectionNew);
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
