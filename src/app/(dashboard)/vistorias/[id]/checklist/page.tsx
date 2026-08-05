import { useCallback, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { AvaliacaoTecnicaPanel } from "@/components/vistoria/avaliacao-tecnica-panel";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { InspectionWizardShell } from "@/components/vistoria/inspection-wizard-shell";
import { useUpdateChecklistItem } from "@/hooks/use-checklist";
import { useInspectionContext } from "@/hooks/use-inspection-context";
import { useUpdateInspection } from "@/hooks/use-inspections";
import { Button } from "@/components/ui/button";
import { ChecklistStatus, InspectionStatus } from "@/lib/enums";
import { useToast } from "@/hooks/use-toast";
import { ROUTES, withNewInspectionFlow } from "@/lib/constants";
import { rememberActiveDraftId } from "@/features/draft/services/draft-service";
import { prepareVistoriaFormForSave } from "@/lib/vistoria-form-defaults";
import type { VistoriaInput } from "@/schemas/vistoria";

export function Page() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isWizardFlow = searchParams.get("fluxo") === "nova";
  const {
    inspectionId,
    inspection,
    checklist: items,
    photos,
    isLoadingChecklist: isLoading,
    isLoading: isLoadingInspection,
  } = useInspectionContext();
  const updateItem = useUpdateChecklistItem(inspectionId);
  const updateInspection = useUpdateInspection(inspectionId);
  const { toast } = useToast();

  useEffect(() => {
    if (isLoading || items.length === 0) return;
    const hash = window.location.hash.replace("#", "");
    if (!hash) return;
    requestAnimationFrame(() => {
      document.getElementById(hash)?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    });
  }, [isLoading, items.length]);

  const handleSaveInspection = useCallback(
    async (data: VistoriaInput) => {
      await updateInspection.mutateAsync(prepareVistoriaFormForSave(data) as VistoriaInput);
      rememberActiveDraftId(inspectionId);
    },
    [inspectionId, updateInspection],
  );

  const handleContinue = useCallback(() => {
    const path = ROUTES.inspectionReport(inspectionId);
    navigate(isWizardFlow ? withNewInspectionFlow(path) : path);
  }, [inspectionId, isWizardFlow, navigate]);

  const handleUpdateChecklistItem = useCallback(
    (itemId: string, status: string, notes?: string) => {
      updateItem.mutate(
        {
          id: itemId,
          patch: {
            status: status as typeof ChecklistStatus.CONFORME,
            notes: notes ?? null,
          },
        },
        {
          onError: (err) => {
            toast(err instanceof Error ? err.message : "Erro ao salvar item");
          },
        },
      );
    },
    [toast, updateItem],
  );

  if (isLoadingInspection || !inspection) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner label="Carregando avaliação técnica..." />
      </div>
    );
  }

  const panel = (
    <AvaliacaoTecnicaPanel
      inspection={inspection}
      inspectionId={inspectionId}
      checklistItems={items}
      photos={photos}
      isLoadingChecklist={isLoading}
      wizardMode={isWizardFlow}
      isSaving={updateInspection.isPending}
      onSaveInspection={handleSaveInspection}
      onUpdateChecklistItem={handleUpdateChecklistItem}
      onBack={
        isWizardFlow
          ? () => navigate(withNewInspectionFlow(ROUTES.inspectionPhotos(inspectionId)))
          : () => navigate(ROUTES.inspection(inspectionId))
      }
      onContinue={handleContinue}
    />
  );

  if (isWizardFlow) {
    return (
      <InspectionWizardShell
        currentStep={2}
        inspectionId={inspectionId}
        title="Avaliação técnica"
        showDraftBanner={inspection.status === InspectionStatus.DRAFT}
        draftExpiresAt={inspection.draft_expires_at}
      >
        {panel}
      </InspectionWizardShell>
    );
  }

  return (
    <div className="space-y-3 md:space-y-4">
      <div className="flex items-center gap-2 md:gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="touch-target shrink-0"
          onClick={() => navigate(ROUTES.inspection(inspectionId))}
          aria-label="Voltar para vistoria"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="min-w-0">
          <h1 className="text-lg font-bold md:text-xl">Avaliação técnica</h1>
          <p className="text-xs text-muted-foreground">
            Dados, checklist e parecer em uma única tela.
          </p>
        </div>
      </div>
      {panel}
    </div>
  );
}
