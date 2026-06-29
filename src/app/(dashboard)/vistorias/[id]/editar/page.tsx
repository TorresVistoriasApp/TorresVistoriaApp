import { useCallback } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VistoriaForm } from "@/components/forms/vistoria-form";
import { InspectionWizardShell } from "@/components/vistoria/inspection-wizard-shell";
import { DraftAutoSaveBanner } from "@/features/draft/components/draft-auto-save-banner";
import { useAutoSaveInspection } from "@/features/draft/hooks/use-auto-save-inspection";
import { rememberActiveDraftId } from "@/features/draft/services/draft-service";
import { useInspection } from "@/hooks/use-inspection";
import { useUpdateInspection } from "@/hooks/use-inspections";
import { useAuth } from "@/hooks/use-auth";
import { isSuperAdmin } from "@/lib/rbac";
import { formatVistoriaFormDefaults } from "@/lib/vistoria-form-defaults";
import { ROUTES, withNewInspectionFlow } from "@/lib/constants";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { InspectionStatus } from "@/lib/enums";
import type { VistoriaInput } from "@/schemas/vistoria";

const EDIT_FORM_ID = "edit-vistoria-form";
const WIZARD_FORM_ID = "wizard-vistoria-form";

export function Page() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isWizardFlow = searchParams.get("fluxo") === "nova";
  const { profile } = useAuth();
  const { data: inspection, isLoading } = useInspection(id);
  const update = useUpdateInspection(id!);
  const { scheduleSave } = useAutoSaveInspection({
    inspectionId: id ?? "",
    enabled: Boolean(id && inspection?.status === InspectionStatus.DRAFT),
  });

  if (isLoading || !inspection) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  const isDraft = inspection.status === InspectionStatus.DRAFT;

  const handleSubmit = async (data: VistoriaInput) => {
    await update.mutateAsync(data);
    if (!id) return;
    rememberActiveDraftId(id);
    if (isWizardFlow) {
      navigate(withNewInspectionFlow(ROUTES.inspectionPhotos(id)));
      return;
    }
    navigate(ROUTES.inspection(id));
  };

  const handleAutoSave = useCallback(
    (data: Partial<VistoriaInput>) => {
      if (!id || !isDraft) return;
      scheduleSave(data);
    },
    [id, isDraft, scheduleSave],
  );

  const handleCancelEdit = () => {
    if (!id) return;
    navigate(ROUTES.inspection(id));
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
        formId={isWizardFlow ? WIZARD_FORM_ID : EDIT_FORM_ID}
        defaultValues={formatVistoriaFormDefaults(inspection)}
        onSubmit={handleSubmit}
        submitLabel={
          isWizardFlow
            ? update.isPending
              ? "Salvando..."
              : "Continuar para fotos"
            : "Salvar"
        }
        showInternalNotes={isSuperAdmin(profile?.role)}
        wizardMode={isWizardFlow}
        stickyActions={!isWizardFlow}
        enableAutoSave={isDraft}
        onAutoSave={handleAutoSave}
        onBack={isWizardFlow ? () => navigate(ROUTES.inspections) : handleCancelEdit}
        backLabel={isWizardFlow ? "Voltar" : "Descartar"}
      />
    </>
  );

  if (isWizardFlow) {
    return (
      <InspectionWizardShell
        currentStep={1}
        inspectionId={id}
        title={`Vistoria #${inspection.inspection_number}`}
        formId={WIZARD_FORM_ID}
        submitLabel="Continuar para fotos"
        isSubmitting={update.isPending}
        onCancel={() => navigate(ROUTES.inspections)}
        showDraftBanner={isDraft}
        draftExpiresAt={inspection.draft_expires_at}
      >
        {form}
      </InspectionWizardShell>
    );
  }

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
