import { Check, ClipboardList, Camera, FileCheck2, FileText, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

export const WIZARD_STEPS = [
  { step: 1, label: "Dados", description: "Contratante e veículo", icon: FileText },
  { step: 2, label: "Fotos", description: "Evidências", icon: Camera },
  { step: 3, label: "Checklist", description: "Avaliação técnica", icon: ClipboardList },
  { step: 4, label: "Laudo", description: "Revisão e PDF", icon: FileCheck2 },
] as const;

export type WizardStep = (typeof WIZARD_STEPS)[number]["step"];

interface InspectionWizardStepperProps {
  currentStep: WizardStep;
  inspectionId?: string;
  onStepClick?: (step: WizardStep) => void;
}

function getStepHint(step: WizardStep, inspectionId?: string): string {
  switch (step) {
    case 1:
      return inspectionId
        ? "Revise e salve para ir ao passo 2 (Fotos)."
        : "Preencha e salve para liberar o passo 2 (Fotos).";
    case 2:
      return "Envie as fotos para liberar o passo 3 (Checklist).";
    case 3:
      return "Avalie o checklist para liberar o passo 4 (Laudo).";
    case 4:
      return "Revise tudo e gere o laudo em PDF.";
  }
}

export function InspectionWizardStepper({
  currentStep,
  inspectionId,
  onStepClick,
}: InspectionWizardStepperProps) {
  const currentMeta = WIZARD_STEPS.find((s) => s.step === currentStep)!;

  return (
    <nav aria-label="Progresso da vistoria" className="w-full space-y-3">
      <ProgressBar currentStep={currentStep} />

      {/* Mobile / tablet: trilha compacta + card do passo atual */}
      <div className="space-y-3 lg:hidden">
        <CompactStepTrack
          currentStep={currentStep}
          inspectionId={inspectionId}
          onStepClick={onStepClick}
        />
        <CurrentStepCard
          step={currentStep}
          label={currentMeta.label}
          description={currentMeta.description}
          hint={getStepHint(currentStep, inspectionId)}
          icon={currentMeta.icon}
        />
      </div>

      {/* Desktop: stepper horizontal completo */}
      <ol className="hidden lg:flex">
        {WIZARD_STEPS.map(({ step, label, description, icon: Icon }, index) => {
          const isCompleted = step < currentStep;
          const isCurrent = step === currentStep;
          const isLocked = step > currentStep;
          const isClickable = Boolean(inspectionId && isCompleted && onStepClick);
          const hint = isCurrent ? getStepHint(step, inspectionId) : "";

          const node = (
            <div
              className={cn(
                "flex w-full flex-col items-center gap-1.5 rounded-xl px-2 py-2",
                isCurrent && "bg-primary/5 ring-1 ring-primary/15",
              )}
            >
              <StepCircle
                isCompleted={isCompleted}
                isCurrent={isCurrent}
                isLocked={isLocked}
                icon={Icon}
                step={step}
                interactive={isClickable}
                size="lg"
              />
              <StepLabel
                step={step}
                label={label}
                description={description}
                isCompleted={isCompleted}
                isCurrent={isCurrent}
                isLocked={isLocked}
                showDescription
              />
              {isCurrent && hint && (
                <p className="mt-0.5 px-1 text-center text-xs leading-relaxed text-muted-foreground">
                  {hint}
                </p>
              )}
            </div>
          );

          return (
            <li
              key={step}
              className={cn("flex min-w-0", index < WIZARD_STEPS.length - 1 && "flex-1")}
            >
              <div className="flex min-w-0 flex-1 flex-col items-stretch">
                {isClickable ? (
                  <button
                    type="button"
                    onClick={() => onStepClick?.(step)}
                    aria-label={`Voltar ao passo ${step}: ${label}`}
                    className="group w-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2"
                  >
                    {node}
                  </button>
                ) : (
                  <div
                    className="w-full"
                    aria-current={isCurrent ? "step" : undefined}
                    aria-disabled={isLocked || undefined}
                  >
                    {node}
                  </div>
                )}
              </div>

              {index < WIZARD_STEPS.length - 1 && (
                <div className="flex min-w-2 flex-1 items-start px-1 pt-6">
                  <div
                    className={cn(
                      "h-0.5 w-full rounded-full",
                      isCompleted ? "bg-primary" : "bg-border",
                    )}
                    aria-hidden
                  />
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

function ProgressBar({ currentStep }: { currentStep: WizardStep }) {
  return (
    <div className="flex items-center gap-3">
      <span className="shrink-0 text-xs font-bold uppercase tracking-wider text-muted-foreground">
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
  );
}

function CompactStepTrack({
  currentStep,
  inspectionId,
  onStepClick,
}: {
  currentStep: WizardStep;
  inspectionId?: string;
  onStepClick?: (step: WizardStep) => void;
}) {
  return (
    <ol className="flex items-start">
      {WIZARD_STEPS.map(({ step, label, icon: Icon }, index) => {
        const isCompleted = step < currentStep;
        const isCurrent = step === currentStep;
        const isLocked = step > currentStep;
        const isClickable = Boolean(inspectionId && isCompleted && onStepClick);

        const content = (
          <div className="flex flex-col items-center gap-1.5">
            <StepCircle
              isCompleted={isCompleted}
              isCurrent={isCurrent}
              isLocked={isLocked}
              icon={Icon}
              step={step}
              interactive={isClickable}
            />
            <span
              className={cn(
                "max-w-[4rem] truncate text-center text-[10px] font-semibold leading-none",
                isCurrent && "text-primary",
                isCompleted && "text-foreground",
                isLocked && "text-muted-foreground/70",
              )}
            >
              {label}
            </span>
          </div>
        );

        return (
          <li
            key={step}
            className={cn("flex min-w-0 items-start", index < WIZARD_STEPS.length - 1 && "flex-1")}
          >
            <div className="mx-auto flex shrink-0 flex-col items-center">
              {isClickable ? (
                <button
                  type="button"
                  onClick={() => onStepClick?.(step)}
                  aria-label={`Voltar ao passo ${step}: ${label}`}
                  className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                >
                  {content}
                </button>
              ) : (
                <div aria-current={isCurrent ? "step" : undefined}>{content}</div>
              )}
            </div>
            {index < WIZARD_STEPS.length - 1 && (
              <div className="flex min-w-3 flex-1 items-center px-0.5 pt-4">
                <div
                  className={cn(
                    "h-0.5 w-full rounded-full",
                    isCompleted ? "bg-primary" : "bg-border",
                  )}
                  aria-hidden
                />
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}

function CurrentStepCard({
  step,
  label,
  description,
  hint,
  icon: Icon,
}: {
  step: WizardStep;
  label: string;
  description: string;
  hint: string;
  icon: typeof FileText;
}) {
  return (
    <div
      className="flex gap-3 rounded-xl border border-primary/20 bg-primary/5 px-3.5 py-3"
      aria-current="step"
    >
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
        {step}
      </span>
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <Icon className="size-4 shrink-0 text-primary" aria-hidden />
          <p className="text-sm font-semibold leading-tight text-foreground">
            {label}
            <span className="font-normal text-muted-foreground">, {description}</span>
          </p>
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">{hint}</p>
      </div>
    </div>
  );
}

function StepCircle({
  isCompleted,
  isCurrent,
  isLocked,
  icon: Icon,
  step,
  interactive,
  size = "md",
}: {
  isCompleted: boolean;
  isCurrent: boolean;
  isLocked: boolean;
  icon: typeof FileText;
  step: WizardStep;
  interactive?: boolean;
  size?: "md" | "lg";
}) {
  return (
    <span
      className={cn(
        "relative flex shrink-0 items-center justify-center rounded-full border-2 transition-all",
        size === "lg" ? "size-10" : "size-8",
        isCurrent &&
          "border-primary bg-primary text-primary-foreground shadow-md ring-4 ring-primary/15",
        isCompleted && "border-primary bg-primary/10 text-primary",
        isLocked && "border-border bg-muted/60 text-muted-foreground/70",
        interactive && "group-hover:border-primary group-hover:bg-primary/20",
      )}
    >
      {isCompleted ? (
        <Check className={cn(size === "lg" ? "size-4" : "size-3.5")} strokeWidth={2.5} />
      ) : isLocked ? (
        <Lock className={cn(size === "lg" ? "size-3.5" : "size-3")} aria-hidden />
      ) : (
        <Icon className={cn(size === "lg" ? "size-4" : "size-3.5")} aria-hidden />
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
  showDescription,
}: {
  step: WizardStep;
  label: string;
  description: string;
  isCompleted: boolean;
  isCurrent: boolean;
  isLocked: boolean;
  showDescription?: boolean;
}) {
  return (
    <div className="flex w-full min-w-0 flex-col items-center gap-0.5">
      <span
        className={cn(
          "text-center text-xs font-semibold leading-tight",
          isCurrent && "text-primary",
          isCompleted && "text-foreground",
          isLocked && "text-muted-foreground/80",
        )}
      >
        <span className="tabular-nums">{step}.</span> {label}
      </span>
      {showDescription && (
        <span
          className={cn(
            "text-center text-[11px] leading-tight text-muted-foreground",
            isCurrent && "text-primary/80",
          )}
        >
          {description}
        </span>
      )}
    </div>
  );
}
