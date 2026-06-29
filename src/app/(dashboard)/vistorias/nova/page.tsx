import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { InspectionWizardShell } from "@/components/vistoria/inspection-wizard-shell";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import {
  useActiveDraft,
  useCreateDraftInspection,
} from "@/features/draft/hooks/use-draft-recovery";
import { useToast } from "@/hooks/use-toast";
import { ROUTES, withNewInspectionFlow } from "@/lib/constants";

export function Page() {
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
      navigate(withNewInspectionFlow(ROUTES.inspectionEdit(activeDraft.id)), { replace: true });
      return;
    }

    if (startedRef.current || isPending) return;
    startedRef.current = true;

    createDraft(undefined, {
      onSuccess: (inspection) => {
        navigate(withNewInspectionFlow(ROUTES.inspectionEdit(inspection.id)), { replace: true });
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
