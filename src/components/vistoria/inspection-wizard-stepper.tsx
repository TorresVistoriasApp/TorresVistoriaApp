import { Check, ClipboardList, Camera, FileCheck2, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

export const WIZARD_STEPS = [
  { step: 1, label: "Dados", icon: FileText },
  { step: 2, label: "Fotos", icon: Camera },
  { step: 3, label: "Checklist", icon: ClipboardList },
  { step: 4, label: "Laudo", icon: FileCheck2 },
] as const;

export type WizardStep = (typeof WIZARD_STEPS)[number]["step"];

interface InspectionWizardStepperProps {
  currentStep: WizardStep;
  inspectionId?: string;
  onStepClick?: (step: WizardStep) => void;
}

export function InspectionWizardStepper({
  currentStep,
  inspectionId,
  onStepClick,
}: InspectionWizardStepperProps) {
  return (
    <nav aria-label="Progresso da vistoria" className="w-full">
      <ol className="flex items-center">
        {WIZARD_STEPS.map(({ step, label, icon: Icon }, index) => {
          const isCompleted = step < currentStep;
          const isCurrent = step === currentStep;
          const isClickable = Boolean(inspectionId && step < currentStep && onStepClick);
          return (
            <li
              key={step}
              className={cn("flex items-center", index < WIZARD_STEPS.length - 1 && "flex-1")}
            >
              <button
                type="button"
                disabled={!isClickable && !isCurrent}
                onClick={() => isClickable && onStepClick?.(step)}
                className={cn(
                  "group flex flex-col items-center gap-1.5 sm:flex-row sm:gap-2",
                  isClickable && "cursor-pointer",
                  !isClickable && !isCurrent && "cursor-default",
                )}
              >
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold transition-all",
                    isCurrent && "border-primary bg-primary text-primary-foreground shadow-md",
                    isCompleted && "border-primary bg-primary/10 text-primary",
                    !isCurrent && !isCompleted && "border-muted-foreground/30 bg-muted text-muted-foreground",
                    isClickable && "group-hover:border-primary group-hover:bg-primary/20",
                  )}
                >
                  {isCompleted ? <Check className="size-4" /> : <Icon className="size-4" />}
                </span>
                <span
                  className={cn(
                    "text-xs font-semibold sm:text-sm",
                    isCurrent && "text-primary",
                    isCompleted && "text-foreground",
                    !isCurrent && !isCompleted && "text-muted-foreground",
                  )}
                >
                  {step}. {label}
                </span>
              </button>
              {index < WIZARD_STEPS.length - 1 && (
                <div
                  className={cn(
                    "mx-2 hidden h-0.5 flex-1 sm:block",
                    isCompleted ? "bg-primary" : "bg-muted",
                  )}
                  aria-hidden
                />
              )}
            </li>
          );
        })}
      </ol>
      {!inspectionId && currentStep === 1 && (
        <p className="mt-3 text-xs text-muted-foreground">
          Salve os dados para liberar fotos e checklist.
        </p>
      )}
    </nav>
  );
}
