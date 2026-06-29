import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  InspectionWizardStepper,
  type WizardStep,
} from "@/components/vistoria/inspection-wizard-stepper";
import { cn } from "@/lib/utils";
import { ROUTES, withNewInspectionFlow } from "@/lib/constants";
import { DraftAutoSaveBanner } from "@/features/draft/components/draft-auto-save-banner";

interface InspectionWizardShellProps {
  currentStep: WizardStep;
  inspectionId?: string;
  title?: string;
  children: React.ReactNode;
  className?: string;
  formId?: string;
  submitLabel?: string;
  isSubmitting?: boolean;
  onCancel?: () => void;
  cancelLabel?: string;
  showDraftBanner?: boolean;
  draftExpiresAt?: string | null;
}

function getStepPath(step: WizardStep, inspectionId: string): string {
  switch (step) {
    case 1:
      return withNewInspectionFlow(ROUTES.inspectionEdit(inspectionId));
    case 2:
      return withNewInspectionFlow(ROUTES.inspectionPhotos(inspectionId));
    case 3:
      return withNewInspectionFlow(ROUTES.inspectionChecklist(inspectionId));
    case 4:
      return withNewInspectionFlow(ROUTES.inspectionReport(inspectionId));
  }
}

export function InspectionWizardShell({
  currentStep,
  inspectionId,
  title = "Nova vistoria",
  children,
  className,
  formId,
  submitLabel = "Salvar e continuar",
  isSubmitting = false,
  onCancel,
  cancelLabel = "Voltar",
  showDraftBanner = false,
  draftExpiresAt,
}: InspectionWizardShellProps) {
  const navigate = useNavigate();

  const handleStepClick = (step: WizardStep) => {
    if (!inspectionId) return;
    navigate(getStepPath(step, inspectionId));
  };

  const handleBack = () => {
    if (onCancel) {
      onCancel();
      return;
    }
    if (currentStep === 1) {
      navigate(ROUTES.inspections);
      return;
    }
    if (!inspectionId) return;
    if (currentStep === 2) {
      navigate(withNewInspectionFlow(ROUTES.inspectionEdit(inspectionId)));
      return;
    }
    if (currentStep === 3) {
      navigate(withNewInspectionFlow(ROUTES.inspectionPhotos(inspectionId)));
      return;
    }
    if (currentStep === 4) {
      navigate(withNewInspectionFlow(ROUTES.inspectionChecklist(inspectionId)));
    }
  };

  const stepLabels: Record<WizardStep, string> = {
    1: "Dados do contratante e do veículo",
    2: "Fotos da vistoria",
    3: "Checklist técnico",
    4: "Revisão e laudo profissional",
  };

  const showHeaderActions = currentStep === 1 && formId;

  return (
    <div className={cn("min-w-0 w-full space-y-4 lg:space-y-5", className)}>
      <div className="page-header-strip lg:sticky lg:top-14 lg:z-10 lg:backdrop-blur-md lg:bg-card/95">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="mt-0.5 shrink-0 touch-target"
              onClick={handleBack}
              aria-label={cancelLabel}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="min-w-0">
              <h1 className="text-lg font-bold tracking-tight sm:text-xl md:text-2xl">{title}</h1>
              <p className="mt-0.5 hidden text-sm text-muted-foreground sm:block">
                Passo {currentStep} de 4: {stepLabels[currentStep]}
              </p>
            </div>
          </div>

          {showHeaderActions && (
            <div className="hidden shrink-0 gap-2 sm:flex">
              <Button type="button" variant="outline" className="touch-target" onClick={handleBack}>
                {cancelLabel}
              </Button>
              <Button
                type="submit"
                form={formId}
                className="touch-target min-w-[180px]"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Salvando..." : submitLabel}
              </Button>
            </div>
          )}
        </div>
      </div>

      {showDraftBanner && (
        <DraftAutoSaveBanner draftExpiresAt={draftExpiresAt} />
      )}

      <div className="rounded-xl border border-border bg-card p-4 shadow-soft sm:p-5 lg:p-4">
        <p className="mb-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground sm:text-xs lg:sr-only">
          Fluxo em 4 etapas
        </p>
        <InspectionWizardStepper
          currentStep={currentStep}
          inspectionId={inspectionId}
          onStepClick={handleStepClick}
        />
      </div>

      {children}
    </div>
  );
}

export function WizardNavButtons({
  onBack,
  onNext,
  backLabel = "Voltar",
  nextLabel = "Continuar",
  nextDisabled,
  nextLoading,
  showBack = true,
}: {
  onBack?: () => void;
  onNext?: () => void;
  backLabel?: string;
  nextLabel?: string;
  nextDisabled?: boolean;
  nextLoading?: boolean;
  showBack?: boolean;
}) {
  return (
    <div className="flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:justify-between">
      {showBack && onBack ? (
        <Button type="button" variant="outline" className="touch-target" onClick={onBack}>
          {backLabel}
        </Button>
      ) : (
        <div />
      )}
      {onNext && (
        <Button
          type="button"
          className="touch-target sm:min-w-[180px]"
          onClick={onNext}
          disabled={nextDisabled || nextLoading}
        >
          {nextLoading ? "Salvando..." : nextLabel}
        </Button>
      )}
    </div>
  );
}
