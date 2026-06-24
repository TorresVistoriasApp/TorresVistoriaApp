import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  InspectionWizardStepper,
  type WizardStep,
} from "@/components/vistoria/inspection-wizard-stepper";
import { cn } from "@/lib/utils";
import { ROUTES, withNewInspectionFlow } from "@/lib/constants";

interface InspectionWizardShellProps {
  currentStep: WizardStep;
  inspectionId?: string;
  title?: string;
  children: React.ReactNode;
  className?: string;
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
}: InspectionWizardShellProps) {
  const navigate = useNavigate();

  const handleStepClick = (step: WizardStep) => {
    if (!inspectionId) return;
    navigate(getStepPath(step, inspectionId));
  };

  const handleBack = () => {
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
    1: "Dados do veículo e cliente",
    2: "Fotos da vistoria",
    3: "Checklist técnico",
    4: "Revisão e laudo profissional",
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-start gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="mt-0.5 shrink-0 touch-target"
          onClick={handleBack}
          aria-label="Voltar"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{title}</h1>
          <p className="text-sm text-muted-foreground">
            Passo {currentStep} de 4 — {stepLabels[currentStep]}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4 shadow-soft sm:p-5">
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
    <div className="flex flex-col-reverse gap-3 border-t border-border pt-4 sm:flex-row sm:justify-between">
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
