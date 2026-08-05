import { useCallback, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { VistoriaForm } from "@/modules/torres-vistoria/components/forms/vistoria-form";
import { DraftAutoSaveBanner } from "@/modules/torres-vistoria/draft/components/draft-auto-save-banner";
import { useAutoSaveInspection } from "@/modules/torres-vistoria/draft/hooks/use-auto-save-inspection";
import { rememberActiveDraftId } from "@/modules/torres-vistoria/draft/services/draft-service";
import { useInspectionContext } from "@/modules/torres-vistoria/hooks/use-inspection-context";
import { useUpdateInspection } from "@/modules/torres-vistoria/hooks/use-inspections";
import { useToast } from "@/shared/hooks/use-toast";
import { usePermission } from "@/core/rbac/use-permission";
import {
  formatVistoriaFormDefaults,
  prepareVistoriaFormForSave,
} from "@/modules/torres-vistoria/domain/vistoria-form-defaults";
import { ROUTES, withNewInspectionFlow } from "@/config/routes";
import { LoadingSpinner } from "@/shared/components/loading-spinner";
import { InspectionStatus } from "@/modules/torres-vistoria/domain/enums";
import type { VistoriaInput } from "@/modules/torres-vistoria/schemas/vistoria";

const EDIT_FORM_ID = "edit-vistoria-form";

export function InspectionEditPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isWizardFlow = searchParams.get("fluxo") === "nova";
  const { can } = usePermission();
  const { inspectionId, inspection, isLoading } = useInspectionContext();
  const { toast } = useToast();
  const update = useUpdateInspection(inspectionId);
  const { scheduleSave } = useAutoSaveInspection({
    inspectionId,
    enabled: Boolean(inspection?.status === InspectionStatus.DRAFT),
  });

  const isDraft = inspection?.status === InspectionStatus.DRAFT;

  useEffect(() => {
    if (!isWizardFlow || !inspectionId) return;
    navigate(withNewInspectionFlow(ROUTES.inspectionPhotos(inspectionId)), { replace: true });
  }, [inspectionId, isWizardFlow, navigate]);

  const handleAutoSave = useCallback(
    (data: Partial<VistoriaInput>) => {
      if (!inspectionId || !isDraft) return;
      scheduleSave(data);
    },
    [inspectionId, isDraft, scheduleSave],
  );

  if (isLoading || !inspection || isWizardFlow) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  const handleSubmit = async (data: VistoriaInput) => {
    try {
      await update.mutateAsync(prepareVistoriaFormForSave(data) as VistoriaInput);
      if (!inspectionId) return;
      rememberActiveDraftId(inspectionId);
      navigate(ROUTES.inspection(inspectionId));
    } catch (err) {
      toast(err instanceof Error ? err.message : "Erro ao salvar vistoria");
    }
  };

  const handleCancelEdit = () => {
    navigate(ROUTES.inspection(inspectionId));
  };

  const form = (
    <>
      {isDraft && (
        <DraftAutoSaveBanner
          draftExpiresAt={inspection.draft_expires_at}
          className="mb-4"
        />
      )}
      <VistoriaForm
        formId={EDIT_FORM_ID}
        defaultValues={formatVistoriaFormDefaults(inspection)}
        onSubmit={handleSubmit}
        submitLabel={update.isPending ? "Salvando..." : "Salvar"}
        showInternalNotes={can("inspections.read.all")}
        stickyActions
        enableAutoSave={isDraft}
        onAutoSave={handleAutoSave}
        onBack={handleCancelEdit}
        backLabel="Descartar"
      />
    </>
  );

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="page-header-strip">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 touch-target"
              onClick={handleCancelEdit}
              aria-label="Descartar alterações e voltar"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="min-w-0">
              <h1 className="text-lg font-bold tracking-tight sm:text-xl">Editar vistoria</h1>
              <p className="text-sm text-muted-foreground">#{inspection.inspection_number}</p>
            </div>
          </div>

          <div className="hidden shrink-0 gap-2 sm:flex">
            <Button type="button" variant="outline" className="touch-target" onClick={handleCancelEdit}>
              Descartar
            </Button>
            <Button
              type="submit"
              form={EDIT_FORM_ID}
              className="touch-target min-w-[140px]"
              disabled={update.isPending}
            >
              {update.isPending ? "Salvando..." : "Salvar alterações"}
            </Button>
          </div>
        </div>
      </div>

      {form}
    </div>
  );
}
