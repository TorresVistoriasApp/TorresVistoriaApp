import { Check, ClipboardList, Camera, FileCheck2, FileText, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

export const WIZARD_STEPS = [
  { step: 1, label: "Dados", description: "Veículo e cliente", icon: FileText },
  { step: 2, label: "Fotos", description: "Evidências", icon: Camera },
  { step: 3, label: "Checklist", description: "Avaliação técnica", icon: ClipboardList },
  { step: 4, label: "Laudo", description: "Revisão e PDF", icon: FileCheck2 },
] as const;

export type WizardStep = (typeof WIZARD_STEPS)[number]["step"];

interface InspectionWizardStepperProps {
  currentStep: WizardStep;
  inspectionId?: string;
  onStepClick?: (step: WizardStep) => void;
  compactOnMobile?: boolean;
}

function getStepHint(currentStep: WizardStep, inspectionId?: string): string {
  switch (currentStep) {
    case 1:
      return inspectionId
        ? "Revise os dados se necessário ou avance para registrar as fotos."
        : "Preencha os dados abaixo e salve para liberar o passo 2 (Fotos).";
    case 2:
      return "Envie as fotos obrigatórias antes de seguir para o checklist.";
    case 3:
      return "Avalie cada item do checklist e depois revise o laudo.";
    case 4:
      return "Confira tudo e gere o laudo profissional em PDF.";
  }
}

export function InspectionWizardStepper({
  currentStep,
  inspectionId,
  onStepClick,
  compactOnMobile = false,
}: InspectionWizardStepperProps) {
  const currentMeta = WIZARD_STEPS.find((s) => s.step === currentStep)!;

  return (
    <nav aria-label="Progresso da vistoria" className="w-full">
      <div className="mb-3 flex items-center gap-3 lg:mb-2">
        <span className="shrink-0 text-xs font-bold uppercase tracking-wider text-muted-foreground lg:sr-only">
          Passo {currentStep} de 4
        </span>
        <div className="flex min-w-0 flex-1 gap-1" aria-hidden>
          {WIZARD_STEPS.map(({ step }) => (
            <div
              key={step}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors",
                step < currentStep && "bg-primary",
                step === currentStep && "bg-primary/70",
                step > currentStep && "bg-muted",
              )}
            />
          ))}
        </div>
      </div>

      {compactOnMobile && (
        <div className="mb-3 flex items-center gap-2 rounded-lg border border-border/60 bg-muted/30 px-3 py-2 md:hidden">
          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
            {currentStep}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">
              {currentMeta.label} — {currentMeta.description}
            </p>
            <p className="text-xs text-muted-foreground">
              {currentStep < 4 ? "Complete para avançar" : "Última etapa"}
            </p>
          </div>
        </div>
      )}

      <ol className={cn("flex", compactOnMobile && "hidden md:flex")}>
        {WIZARD_STEPS.map(({ step, label, description, icon: Icon }, index) => {
          const isCompleted = step < currentStep;
          const isCurrent = step === currentStep;
          const isLocked = step > currentStep;
          const isClickable = Boolean(inspectionId && isCompleted && onStepClick);
          const connectorFilled = isCompleted;

          const node = (
            <>
              <StepCircle
                isCompleted={isCompleted}
                isCurrent={isCurrent}
                isLocked={isLocked}
                icon={Icon}
                step={step}
                interactive={isClickable}
              />
              <StepLabel
                step={step}
                label={label}
                description={description}
                isCompleted={isCompleted}
                isCurrent={isCurrent}
                isLocked={isLocked}
              />
            </>
          );

          return (
            <li
              key={step}
              className={cn("flex min-w-0", index < WIZARD_STEPS.length - 1 && "flex-1")}
            >
              <div className="flex min-w-0 shrink-0 flex-col items-center">
                {isClickable ? (
                  <button
                    type="button"
                    onClick={() => onStepClick?.(step)}
                    aria-label={`Voltar ao passo ${step}: ${label}`}
                    className="group flex flex-col items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 rounded-lg"
                  >
                    {node}
                  </button>
                ) : (
                  <div
                    className="flex flex-col items-center gap-1"
                    aria-current={isCurrent ? "step" : undefined}
                    aria-disabled={isLocked || undefined}
                  >
                    {node}
                  </div>
                )}
              </div>

              {index < WIZARD_STEPS.length - 1 && (
                <div className="flex min-w-[0.375rem] flex-1 items-start px-0.5 pt-4 sm:px-1 sm:pt-5">
                  <div
                    className={cn(
                      "h-0.5 w-full rounded-full",
                      connectorFilled ? "bg-primary" : "bg-border",
                    )}
                    aria-hidden
                  />
                </div>
              )}
            </li>
          );
        })}
      </ol>

      <div className="mt-3 rounded-xl border border-primary/25 bg-primary/5 px-3 py-2.5 sm:px-4 sm:py-3 lg:hidden">
        <p className="text-sm font-semibold text-foreground">
          <span className="text-primary">Agora:</span> {currentStep}. {currentMeta.label} —{" "}
          {currentMeta.description}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
          {getStepHint(currentStep, inspectionId)}
        </p>
        {currentStep < 4 && (
          <p className="mt-2 flex items-start gap-1.5 text-xs text-muted-foreground">
            <Lock className="mt-0.5 size-3 shrink-0 opacity-70" aria-hidden />
            <span>Complete este passo para liberar o próximo.</span>
          </p>
        )}
      </div>
    </nav>
  );
}

function StepCircle({
  isCompleted,
  isCurrent,
  isLocked,
  icon: Icon,
  step,
  interactive,
}: {
  isCompleted: boolean;
  isCurrent: boolean;
  isLocked: boolean;
  icon: typeof FileText;
  step: WizardStep;
  interactive?: boolean;
}) {
  return (
    <span
      className={cn(
        "relative flex size-8 shrink-0 items-center justify-center rounded-full border-2 transition-all sm:size-10",
        isCurrent &&
          "border-primary bg-primary text-primary-foreground shadow-md ring-4 ring-primary/15",
        isCompleted && "border-primary bg-primary/10 text-primary",
        isLocked && "border-border bg-muted/60 text-muted-foreground/70",
        interactive && "group-hover:border-primary group-hover:bg-primary/20",
      )}
    >
      {isCompleted ? (
        <Check className="size-3.5 sm:size-4" strokeWidth={2.5} />
      ) : isLocked ? (
        <Lock className="size-3 sm:size-3.5" aria-hidden />
      ) : (
        <Icon className="size-3.5 sm:size-4" aria-hidden />
      )}
      {isCurrent && (
        <span className="absolute -bottom-0.5 left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-primary-foreground sm:hidden" />
      )}
      <span className="sr-only">
        Passo {step}
        {isCompleted ? ", concluído" : isCurrent ? ", em andamento" : ", bloqueado"}
      </span>
    </span>
  );
}

function StepLabel({
  step,
  label,
  description,
  isCompleted,
  isCurrent,
  isLocked,
}: {
  step: WizardStep;
  label: string;
  description: string;
  isCompleted: boolean;
  isCurrent: boolean;
  isLocked: boolean;
}) {
  return (
    <div className="flex max-w-[4.5rem] flex-col items-center gap-0.5 sm:max-w-[5.5rem] md:max-w-none">
      <span
        className={cn(
          "text-center text-[10px] font-semibold leading-tight sm:text-xs lg:text-[11px]",
          isCurrent && "text-primary",
          isCompleted && "text-foreground",
          isLocked && "text-muted-foreground/80",
        )}
      >
        <span className="tabular-nums">{step}.</span> {label}
      </span>
      <span
        className={cn(
          "hidden text-center text-[10px] leading-tight md:block lg:hidden xl:block",
          isCurrent ? "text-primary/80" : "text-muted-foreground",
        )}
      >
        {description}
      </span>
    </div>
  );
}
