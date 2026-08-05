import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { InspectionWizardShell } from "@/modules/torres-vistoria/components/vistoria/inspection-wizard-shell";
import { LoadingSpinner } from "@/shared/components/loading-spinner";
import {
  useActiveDraft,
  useCreateDraftInspection,
} from "@/modules/torres-vistoria/draft/hooks/use-draft-recovery";
import { useToast } from "@/shared/hooks/use-toast";
import { ROUTES, withNewInspectionFlow } from "@/config/routes";

export function InspectionNewPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { data: activeDraft, isLoading: loadingDraft } = useActiveDraft();
  const { mutate: createDraft, isPending } = useCreateDraftInspection();
  const startedRef = useRef(false);
  const redirectedRef = useRef<string | null>(null);

  useEffect(() => {
    return () => {
      startedRef.current = false;
      redirectedRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (loadingDraft) return;

    if (activeDraft) {
      if (redirectedRef.current === activeDraft.id) return;
      redirectedRef.current = activeDraft.id;
      navigate(withNewInspectionFlow(ROUTES.inspectionPhotos(activeDraft.id)), { replace: true });
      return;
    }

    if (startedRef.current || isPending) return;
    startedRef.current = true;

    createDraft(undefined, {
      onSuccess: (inspection) => {
        navigate(withNewInspectionFlow(ROUTES.inspectionPhotos(inspection.id)), { replace: true });
      },
      onError: (err) => {
        startedRef.current = false;
        toast(err instanceof Error ? err.message : "Erro ao iniciar rascunho");
        navigate(ROUTES.inspections);
      },
    });
  }, [activeDraft, loadingDraft, navigate, toast, createDraft, isPending]);

  return (
    <InspectionWizardShell currentStep={1} title="Nova vistoria">
      <div className="flex justify-center py-16">
        <LoadingSpinner label="Preparando rascunho automático..." />
      </div>
    </InspectionWizardShell>
  );
}
