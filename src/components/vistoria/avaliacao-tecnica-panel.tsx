import { useCallback, useEffect, useMemo, useRef, useState, type Dispatch, type SetStateAction } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import type { ChecklistItem } from "@/services/checklist-service";
import type { Inspection } from "@/services/inspection-service";
import type { InspectionPhoto } from "@/services/photo-service";
import { ClienteForm } from "@/components/forms/cliente-form";
import { VeiculoForm } from "@/components/forms/veiculo-form";
import { FormField } from "@/components/forms/form-field";
import { PlateLookupHint, type PlateLookupState } from "@/components/forms/plate-lookup-hint";
import { CompactChecklistForm } from "@/components/checklist/compact-checklist-form";
import { validateChecklistCompletion } from "@/components/forms/checklist-form";
import {
  ParecerTecnicoSection,
  useParecerTecnicoDraft,
  validateParecerTecnico,
  type ParecerTecnicoValue,
} from "@/components/forms/parecer-tecnico-section";
import { EvaluationSection } from "@/components/vistoria/evaluation-section";
import { WizardNavButtons } from "@/components/vistoria/inspection-wizard-shell";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Input } from "@/components/ui/input";
import { MaskedInput } from "@/components/ui/masked-input";
import { Button } from "@/components/ui/button";
import { useAutoSaveInspection } from "@/features/draft/hooks/use-auto-save-inspection";
import { useInspectionTypes } from "@/hooks/use-inspection-types";
import { useToast } from "@/hooks/use-toast";
import { InspectionSituation, InspectionStatus } from "@/lib/enums";
import { formatCurrency, formatPlate } from "@/lib/formatters";
import {
  evaluationGridClass,
  selectInputClass,
} from "@/lib/form-styles";
import { maskCurrency } from "@/lib/masks";
import { computeCaptureProgress } from "@/lib/photos/photo-progress";
import { PHOTO_REQUIREMENTS_ENABLED } from "@/lib/photos/photo-requirements-flag";
import {
  formatVistoriaFormDefaults,
  prepareVistoriaFormForSave,
} from "@/lib/vistoria-form-defaults";
import { summarizeChecklist } from "@/components/checklist/checklist-summary";
import { vistoriaDraftSchema, vistoriaWizardContinueSchema, type VistoriaInput } from "@/schemas/vistoria";
import { cn } from "@/lib/utils";
import { Camera, Car, FileText, MapPin, Save, AlertCircle } from "lucide-react";

const PLATE_PATTERN = /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/;

type EvaluationBlocker = {
  id: string;
  message: string;
  sectionId: string;
};

function getFieldSectionId(field: string): string {
  if (
    ["inspection_date", "inspection_time", "location", "inspection_type_id", "requester_name"].includes(
      field,
    )
  ) {
    return "avaliacao-identificacao";
  }
  if (field.startsWith("client_")) return "avaliacao-contratante";
  if (
    [
      "buyer_name",
      "buyer_document",
      "seller_name",
      "seller_document",
      "judicial_process",
      "judicial_court",
      "market_fipe_value",
      "insurance_acceptance_percent",
    ].includes(field)
  ) {
    return "avaliacao-complementares";
  }
  return "avaliacao-veiculo";
}

function buildEvaluationBlockers(
  formValues: Partial<VistoriaInput>,
  checklistItems: ChecklistItem[],
  parecer: ParecerTecnicoValue,
): EvaluationBlocker[] {
  const blockers: EvaluationBlocker[] = [];
  const { inspection_purpose: _p, opinion: _o, technical_notes: _t, ...rest } = formValues;

  const parsed = vistoriaWizardContinueSchema.safeParse({
    ...rest,
    opinion: undefined,
    technical_notes: "",
  });

  if (!parsed.success) {
    const seenFields = new Set<string>();
    for (const issue of parsed.error.issues) {
      const field = String(issue.path[0] ?? "");
      if (field && seenFields.has(field)) continue;
      if (field) seenFields.add(field);
      blockers.push({
        id: `field-${field || issue.code}`,
        message: issue.message,
        sectionId: field ? getFieldSectionId(field) : "avaliacao-identificacao",
      });
    }
  }

  const checklist = validateChecklistCompletion(checklistItems);
  if (checklist.pendingCount > 0) {
    blockers.push({
      id: "checklist-pending",
      message: `${checklist.pendingCount} item(ns) do checklist sem avaliação`,
      sectionId: "avaliacao-checklist",
    });
  }
  if (checklist.missingNotesCount > 0) {
    blockers.push({
      id: "checklist-notes",
      message: `${checklist.missingNotesCount} apontamento(s) sem observação obrigatória`,
      sectionId: "avaliacao-checklist",
    });
  }

  const parecerResult = validateParecerTecnico(parecer);
  if (parecerResult.errors.opinion) {
    blockers.push({
      id: "parecer-opinion",
      message: parecerResult.errors.opinion,
      sectionId: "checklist-parecer",
    });
  }
  if (parecerResult.errors.technical_notes) {
    blockers.push({
      id: "parecer-notes",
      message: parecerResult.errors.technical_notes,
      sectionId: "checklist-parecer",
    });
  }

  return blockers;
}

function EvaluationBlockersBanner({
  blockers,
  onGoTo,
}: {
  blockers: EvaluationBlocker[];
  onGoTo: (sectionId: string) => void;
}) {
  if (blockers.length === 0) return null;

  return (
    <div
      className="rounded-lg border border-amber-200/80 bg-amber-50/60 px-3 py-2.5"
      role="status"
      aria-live="polite"
    >
      <p className="flex items-center gap-1.5 text-xs font-semibold text-amber-900">
        <AlertCircle className="size-3.5 shrink-0" />
        Para continuar, complete:
      </p>
      <ul className="mt-1.5 space-y-1">
        {blockers.map((blocker) => (
          <li key={blocker.id}>
            <button
              type="button"
              onClick={() => onGoTo(blocker.sectionId)}
              className="text-left text-xs text-amber-900 underline-offset-2 hover:underline"
            >
              {blocker.message}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function sectionBlockerStatus(blockers: EvaluationBlocker[], sectionId: string) {
  const count = blockers.filter((blocker) => blocker.sectionId === sectionId).length;
  if (count === 0) {
    return { statusText: "Ok", statusTone: "success" as const };
  }
  return { statusText: `${count} pendência(s)`, statusTone: "warning" as const };
}

function sectionOpenProps(
  sectionId: string,
  sectionOpen: Record<string, boolean>,
  setSectionOpen: Dispatch<SetStateAction<Record<string, boolean>>>,
  defaultOpen = false,
) {
  return {
    open: sectionOpen[sectionId] ?? defaultOpen,
    onOpenChange: (open: boolean) => setSectionOpen((prev) => ({ ...prev, [sectionId]: open })),
  };
}

interface AvaliacaoTecnicaPanelProps {
  inspection: Inspection;
  inspectionId: string;
  checklistItems: ChecklistItem[];
  photos: InspectionPhoto[];
  isLoadingChecklist: boolean;
  wizardMode?: boolean;
  isSaving?: boolean;
  onSaveInspection: (data: VistoriaInput) => Promise<void>;
  onUpdateChecklistItem: (itemId: string, status: string, notes?: string) => void;
  onBack?: () => void;
  onContinue: () => void;
}

function EvaluationProgressBar({
  label,
  percent,
  pending,
}: {
  label: string;
  percent: number;
  pending?: boolean;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[11px]">
        <span className="font-medium text-foreground">{label}</span>
        <span className={cn("tabular-nums", pending ? "text-amber-700" : "text-muted-foreground")}>
          {pending ? "Pendente" : `${percent}%`}
        </span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-300",
            pending ? "w-0" : percent === 100 ? "bg-emerald-500" : "bg-primary",
          )}
          style={{ width: pending ? "0%" : `${percent}%` }}
        />
      </div>
    </div>
  );
}

export function AvaliacaoTecnicaPanel({
  inspection,
  inspectionId,
  checklistItems,
  photos,
  isLoadingChecklist,
  wizardMode = false,
  isSaving = false,
  onSaveInspection,
  onUpdateChecklistItem,
  onBack,
  onContinue,
}: AvaliacaoTecnicaPanelProps) {
  const { toast } = useToast();
  const { data: inspectionTypes = [], isLoading: typesLoading } = useInspectionTypes(true);
  const formRef = useRef<HTMLFormElement>(null);
  const isDraft = inspection.status === InspectionStatus.DRAFT;

  const [parecerErrors, setParecerErrors] = useState<
    Partial<Record<keyof ParecerTecnicoValue, string>>
  >({});
  const [plateLookupState, setPlateLookupState] = useState<PlateLookupState>("idle");
  const plateLookupTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [sectionOpen, setSectionOpen] = useState<Record<string, boolean>>({
    "avaliacao-identificacao": true,
  });
  const [showValidationHints, setShowValidationHints] = useState(false);

  const {
    register,
    control,
    watch,
    getValues,
    setError,
    clearErrors,
    formState: { errors, isSubmitting, submitCount },
  } = useForm<VistoriaInput>({
    resolver: zodResolver(vistoriaDraftSchema),
    defaultValues: {
      inspection_date: new Date().toISOString().slice(0, 10),
      inspection_time: new Date().toTimeString().slice(0, 5),
      situation: InspectionSituation.PARTICULAR,
      is_armored: false,
      status: InspectionStatus.DRAFT,
      client_phone: "",
      client_email: "",
      renavam: "",
      version: "",
      ...formatVistoriaFormDefaults(inspection),
    },
  });

  const { scheduleSave } = useAutoSaveInspection({
    inspectionId,
    enabled: isDraft,
  });

  const formValues = watch();
  const selectedTypeId = watch("inspection_type_id");
  const plateValue = watch("plate");
  const selectedType = inspectionTypes.find((type) => type.id === selectedTypeId);

  const checklistSummary = useMemo(
    () => summarizeChecklist(checklistItems),
    [checklistItems],
  );

  const photoProgress = useMemo(
    () => computeCaptureProgress(photos),
    [photos],
  );

  const dadosValid = useMemo(() => {
    const { inspection_purpose: _p, opinion: _o, technical_notes: _t, ...rest } = formValues;
    return vistoriaWizardContinueSchema.safeParse({
      ...rest,
      opinion: undefined,
      technical_notes: "",
    }).success;
  }, [formValues]);

  const checklistValid = useMemo(
    () => validateChecklistCompletion(checklistItems).valid,
    [checklistItems],
  );

  const initialParecer = useMemo<ParecerTecnicoValue>(
    () => ({
      opinion: inspection.opinion ?? "",
      technical_notes: inspection.technical_notes ?? "",
    }),
    [inspection.opinion, inspection.technical_notes],
  );

  const persistParecer = useCallback(
    (value: ParecerTecnicoValue) => {
      scheduleSave({
        opinion: (value.opinion || null) as VistoriaInput["opinion"],
        technical_notes: value.technical_notes,
      });
    },
    [scheduleSave],
  );

  const [parecer, setParecer] = useParecerTecnicoDraft(initialParecer, persistParecer);
  const parecerValidation = useMemo(() => validateParecerTecnico(parecer), [parecer]);
  const parecerValid = parecerValidation.valid;

  const blockers = useMemo(
    () => buildEvaluationBlockers(formValues, checklistItems, parecer),
    [formValues, checklistItems, parecer],
  );

  const parecerDisplayErrors = useMemo(() => {
    if (!showValidationHints) return parecerErrors;
    return { ...parecerValidation.errors, ...parecerErrors };
  }, [parecerValidation.errors, parecerErrors, showValidationHints]);

  const scrollToSection = useCallback((sectionId: string) => {
    setSectionOpen((prev) => ({ ...prev, [sectionId]: true }));
    requestAnimationFrame(() => {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, []);

  const checklistPercent =
    checklistItems.length > 0
      ? Math.round((checklistSummary.evaluated / checklistItems.length) * 100)
      : 0;

  const photosPercent = PHOTO_REQUIREMENTS_ENABLED
    ? photoProgress.totalRequired > 0
      ? Math.round((photoProgress.totalCompleted / photoProgress.totalRequired) * 100)
      : 100
    : photos.length > 0
      ? 100
      : 0;

  const canContinue = dadosValid && checklistValid && parecerValid;
  const isBusy = isSaving || isSubmitting;

  useEffect(() => {
    const subscription = watch((values) => {
      if (!isDraft) return;
      scheduleSave(values as Partial<VistoriaInput>);
    });
    return () => subscription.unsubscribe();
  }, [isDraft, scheduleSave, watch]);

  useEffect(() => {
    if (submitCount === 0 || Object.keys(errors).length === 0) return;
    formRef.current?.querySelector("[role='alert'], .text-destructive")?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [submitCount, errors]);

  useEffect(() => {
    if (plateLookupTimer.current) clearTimeout(plateLookupTimer.current);
    const normalized = (plateValue ?? "").replace(/[^A-Za-z0-9]/g, "").toUpperCase();
    if (!PLATE_PATTERN.test(normalized)) {
      setPlateLookupState("idle");
      return;
    }
    setPlateLookupState("loading");
    plateLookupTimer.current = setTimeout(() => setPlateLookupState("idle"), 1200);
    return () => {
      if (plateLookupTimer.current) clearTimeout(plateLookupTimer.current);
    };
  }, [plateValue]);

  const handleParecerChange = (value: ParecerTecnicoValue) => {
    setParecerErrors({});
    setParecer(value);
  };

  const validateAndContinue = async () => {
    setShowValidationHints(true);
    clearErrors();

    const { inspection_purpose: _purpose, ...values } = getValues();
    const parsed = vistoriaWizardContinueSchema.safeParse({
      ...values,
      opinion: undefined,
      technical_notes: "",
    });

    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (typeof field === "string") {
          setError(field as keyof VistoriaInput, { message: issue.message });
        }
      }
      const firstField = parsed.error.issues[0]?.path[0];
      if (typeof firstField === "string") {
        scrollToSection(getFieldSectionId(firstField));
      }
      toast(parsed.error.issues[0]?.message ?? "Verifique os campos obrigatórios.");
      return;
    }

    const checklistResult = validateChecklistCompletion(checklistItems);
    if (!checklistResult.valid) {
      if (checklistResult.pendingCount > 0) {
        toast(`Avalie todos os itens. Faltam ${checklistResult.pendingCount} pendente(s).`);
      } else if (checklistResult.missingNotesCount > 0) {
        toast(`Preencha observações nos ${checklistResult.missingNotesCount} item(ns) com apontamentos.`);
      }
      scrollToSection("avaliacao-checklist");
      return;
    }

    const parecerResult = validateParecerTecnico(parecer);
    if (!parecerResult.valid) {
      setParecerErrors(parecerResult.errors);
      scrollToSection("checklist-parecer");
      toast(
        parecerResult.errors.opinion ??
          parecerResult.errors.technical_notes ??
          "Complete o parecer técnico.",
      );
      return;
    }

    try {
      await onSaveInspection({
        ...prepareVistoriaFormForSave({
          ...parsed.data,
          opinion: parecer.opinion as VistoriaInput["opinion"],
          technical_notes: parecer.technical_notes.trim(),
        }) as VistoriaInput,
        inspection_purpose: null,
      });
      onContinue();
    } catch (err) {
      toast(err instanceof Error ? err.message : "Erro ao salvar avaliação técnica");
    }
  };

  const vehicleLabel = [formValues.brand, formValues.model, formValues.model_year]
    .filter(Boolean)
    .join(" ");

  return (
    <form
      ref={formRef}
      onSubmit={(e) => {
        e.preventDefault();
        void validateAndContinue();
      }}
      className="w-full space-y-2.5 sm:space-y-3"
    >
      <div className="sticky top-14 z-20 -mx-1 space-y-2 rounded-lg border border-border/80 bg-card/95 px-2.5 py-2 shadow-sm backdrop-blur-md sm:top-[3.75rem] sm:px-3">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground sm:text-xs">
          <span className="inline-flex items-center gap-1">
            <Camera className="size-3 shrink-0" />
            {PHOTO_REQUIREMENTS_ENABLED
              ? `${photoProgress.totalCompleted}/${photoProgress.totalRequired} fotos`
              : `${photos.length} fotos`}
          </span>
          {vehicleLabel && (
            <span className="inline-flex items-center gap-1">
              <Car className="size-3 shrink-0" />
              <span className="max-w-[10rem] truncate font-medium text-foreground sm:max-w-none">
                {vehicleLabel}
              </span>
            </span>
          )}
          {formValues.plate && (
            <span className="font-mono font-semibold text-foreground">
              {formatPlate(formValues.plate)}
            </span>
          )}
          {formValues.location && (
            <span className="inline-flex min-w-0 items-center gap-1">
              <MapPin className="size-3 shrink-0" />
              <span className="truncate">{formValues.location}</span>
            </span>
          )}
        </div>
        {isDraft && (
          <p className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-700">
            <Save className="size-3" />
            Rascunho salvo automaticamente
          </p>
        )}
        {blockers.length > 0 && (
          <p className="flex items-center gap-1 text-[10px] font-medium text-amber-800 sm:text-[11px]">
            <AlertCircle className="size-3 shrink-0" />
            {blockers.length} pendência(s) para continuar
          </p>
        )}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <EvaluationProgressBar label="Fotos" percent={photosPercent} />
          <EvaluationProgressBar label="Dados" percent={dadosValid ? 100 : 0} pending={!dadosValid} />
          <EvaluationProgressBar label="Checklist" percent={checklistPercent} pending={!checklistValid} />
          <EvaluationProgressBar label="Parecer" percent={parecerValid ? 100 : 0} pending={!parecerValid} />
        </div>
      </div>

      <EvaluationSection
        id="avaliacao-identificacao"
        title="Identificação"
        dense
        {...sectionOpenProps("avaliacao-identificacao", sectionOpen, setSectionOpen, true)}
        {...sectionBlockerStatus(blockers, "avaliacao-identificacao")}
      >
        <div className={evaluationGridClass}>
          <FormField label="Data" error={errors.inspection_date?.message}>
            <Input type="date" {...register("inspection_date")} />
          </FormField>
          <FormField label="Hora" error={errors.inspection_time?.message}>
            <Input type="time" {...register("inspection_time")} />
          </FormField>
          <FormField label="Local" error={errors.location?.message}>
            <Input {...register("location")} placeholder="Endereço ou referência" />
          </FormField>
          <FormField label="Tipo de vistoria" error={errors.inspection_type_id?.message}>
            <select
              {...register("inspection_type_id")}
              disabled={typesLoading || inspectionTypes.length === 0}
              className={selectInputClass}
            >
              <option value="">{typesLoading ? "Carregando..." : "Selecione"}</option>
              {inspectionTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Valor da vistoria" optional>
            <Input
              readOnly
              value={selectedType ? formatCurrency(selectedType.amount) : "—"}
              className="bg-muted/30"
            />
          </FormField>
          <FormField label="Indicado por" error={errors.requester_name?.message} optional>
            <Input {...register("requester_name")} placeholder="Opcional" />
          </FormField>
        </div>
      </EvaluationSection>

      <EvaluationSection
        id="avaliacao-veiculo"
        title="Veículo"
        dense
        {...sectionOpenProps("avaliacao-veiculo", sectionOpen, setSectionOpen)}
        {...sectionBlockerStatus(blockers, "avaliacao-veiculo")}
      >
        <PlateLookupHint state={plateLookupState} />
        <VeiculoForm control={control} register={register} errors={errors} embedded evaluation />
      </EvaluationSection>

      <EvaluationSection
        id="avaliacao-contratante"
        title="Contratante"
        dense
        {...sectionOpenProps("avaliacao-contratante", sectionOpen, setSectionOpen)}
        {...sectionBlockerStatus(blockers, "avaliacao-contratante")}
      >
        <ClienteForm control={control} register={register} errors={errors} embedded compact />
      </EvaluationSection>

      <EvaluationSection
        id="avaliacao-complementares"
        title="Informações complementares"
        optional
        dense
      >
        <div className={evaluationGridClass}>
          <FormField label="Comprador" error={errors.buyer_name?.message} optional>
            <Input {...register("buyer_name")} />
          </FormField>
          <FormField label="CPF/CNPJ comprador" error={errors.buyer_document?.message} optional>
            <Input {...register("buyer_document")} />
          </FormField>
          <FormField label="Vendedor" error={errors.seller_name?.message} optional>
            <Input {...register("seller_name")} />
          </FormField>
          <FormField label="CPF/CNPJ vendedor" error={errors.seller_document?.message} optional>
            <Input {...register("seller_document")} />
          </FormField>
          <FormField label="Processo judicial" error={errors.judicial_process?.message} optional>
            <Input {...register("judicial_process")} />
          </FormField>
          <FormField label="Vara ou órgão" error={errors.judicial_court?.message} optional>
            <Input {...register("judicial_court")} />
          </FormField>
          <FormField label="Valor FIPE" error={errors.market_fipe_value?.message} optional>
            <Controller
              control={control}
              name="market_fipe_value"
              render={({ field }) => (
                <MaskedInput
                  mask="currency"
                  value={
                    typeof field.value === "number"
                      ? maskCurrency(String(field.value))
                      : (field.value ?? "")
                  }
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  placeholder="R$ 0,00"
                />
              )}
            />
          </FormField>
          <FormField label="Aceitação seguro (%)" error={errors.insurance_acceptance_percent?.message} optional>
            <Input type="number" inputMode="decimal" min={0} max={100} {...register("insurance_acceptance_percent")} />
          </FormField>
        </div>
      </EvaluationSection>

      <EvaluationSection
        id="avaliacao-checklist"
        title="Checklist técnico"
        dense
        {...sectionOpenProps("avaliacao-checklist", sectionOpen, setSectionOpen)}
        statusText={
          checklistValid
            ? "Concluído"
            : blockers.some((blocker) => blocker.sectionId === "avaliacao-checklist")
              ? sectionBlockerStatus(blockers, "avaliacao-checklist").statusText
              : `${checklistSummary.pending} pendente(s)`
        }
        statusTone={checklistValid ? "success" : "warning"}
      >
        {isLoadingChecklist ? (
          <LoadingSpinner label="Carregando checklist..." />
        ) : checklistItems.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">Nenhum item encontrado.</p>
        ) : (
          <CompactChecklistForm
            items={checklistItems}
            disabled={isSaving}
            onUpdate={onUpdateChecklistItem}
          />
        )}
      </EvaluationSection>

      <ParecerTecnicoSection
        value={parecer}
        onChange={handleParecerChange}
        errors={parecerDisplayErrors}
        disabled={isSaving}
        variant="compact"
        className={cn(
          !parecerValid && showValidationHints && "border-amber-300 ring-1 ring-amber-200/80",
        )}
      />

      <EvaluationBlockersBanner blockers={blockers} onGoTo={scrollToSection} />

      <div className="border-t border-border/60 pt-3">
        {wizardMode ? (
          <WizardNavButtons
            onBack={onBack}
            onNext={() => void validateAndContinue()}
            nextLabel={canContinue ? "Revisar e gerar laudo" : "Ver pendências e continuar"}
            nextDisabled={isBusy}
            nextLoading={isBusy}
          />
        ) : (
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-between">
            {onBack && (
              <Button type="button" variant="outline" className="touch-target" onClick={onBack}>
                Voltar
              </Button>
            )}
            <Button
              type="submit"
              className="h-11 w-full touch-target sm:ml-auto sm:w-auto sm:min-w-[220px]"
              disabled={isBusy}
            >
              <FileText className="mr-2 h-4 w-4" />
              {isBusy
                ? "Salvando..."
                : canContinue
                  ? "Revisar e gerar laudo"
                  : "Ver pendências e continuar"}
            </Button>
          </div>
        )}
      </div>
    </form>
  );
}
