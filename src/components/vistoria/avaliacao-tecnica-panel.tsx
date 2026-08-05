import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import type { ChecklistItem } from "@/services/checklist-service";
import type { Inspection } from "@/services/inspection-service";
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
import { formatCurrency } from "@/lib/formatters";
import {
  formGridClass,
  formGridFullWidthClass,
  selectInputClass,
} from "@/lib/form-styles";
import { maskCurrency } from "@/lib/masks";
import {
  formatVistoriaFormDefaults,
  prepareVistoriaFormForSave,
} from "@/lib/vistoria-form-defaults";
import { summarizeChecklist } from "@/components/checklist/checklist-summary";
import { vistoriaDraftSchema, vistoriaWizardContinueSchema, type VistoriaInput } from "@/schemas/vistoria";
import { cn } from "@/lib/utils";
import { FileText } from "lucide-react";

const PLATE_PATTERN = /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/;

interface AvaliacaoTecnicaPanelProps {
  inspection: Inspection;
  inspectionId: string;
  checklistItems: ChecklistItem[];
  isLoadingChecklist: boolean;
  wizardMode?: boolean;
  isSaving?: boolean;
  onSaveInspection: (data: VistoriaInput) => Promise<void>;
  onUpdateChecklistItem: (itemId: string, status: string, notes?: string) => void;
  onBack?: () => void;
  onContinue: () => void;
}

export function AvaliacaoTecnicaPanel({
  inspection,
  inspectionId,
  checklistItems,
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

  const plateValue = watch("plate");
  const selectedTypeId = watch("inspection_type_id");
  const selectedType = inspectionTypes.find((type) => type.id === selectedTypeId);

  const checklistSummary = useMemo(
    () => summarizeChecklist(checklistItems),
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
    if (plateLookupTimer.current) {
      clearTimeout(plateLookupTimer.current);
    }

    const normalized = (plateValue ?? "").replace(/[^A-Za-z0-9]/g, "").toUpperCase();
    if (!PLATE_PATTERN.test(normalized)) {
      setPlateLookupState("idle");
      return;
    }

    // Placeholder: estrutura pronta para integração futura com API de placa.
    setPlateLookupState("loading");
    plateLookupTimer.current = setTimeout(() => {
      setPlateLookupState("idle");
    }, 1200);

    return () => {
      if (plateLookupTimer.current) clearTimeout(plateLookupTimer.current);
    };
  }, [plateValue]);

  const handleParecerChange = (value: ParecerTecnicoValue) => {
    setParecerErrors({});
    setParecer(value);
  };

  const validateAndContinue = async () => {
    clearErrors();
    const { inspection_purpose: _purpose, ...values } = getValues();
    const parsed = vistoriaWizardContinueSchema.safeParse(values);

    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (typeof field === "string") {
          setError(field as keyof VistoriaInput, { message: issue.message });
        }
      }
      toast(parsed.error.issues[0]?.message ?? "Verifique os campos obrigatórios.");
      requestAnimationFrame(() => {
        formRef.current?.querySelector("[role='alert'], .text-destructive")?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      });
      return;
    }

    const checklistResult = validateChecklistCompletion(checklistItems);
    if (!checklistResult.valid) {
      if (checklistResult.pendingCount > 0) {
        toast(`Avalie todos os itens. Faltam ${checklistResult.pendingCount} pendente(s).`);
      } else if (checklistResult.missingNotesCount > 0) {
        toast(
          `Preencha observações nos ${checklistResult.missingNotesCount} item(ns) com apontamentos.`,
        );
      }
      document.getElementById("avaliacao-checklist")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      return;
    }

    const parecerResult = validateParecerTecnico(parecer);
    if (!parecerResult.valid) {
      setParecerErrors(parecerResult.errors);
      toast(
        parecerResult.errors.opinion ??
          parecerResult.errors.technical_notes ??
          "Preencha o parecer técnico antes de continuar.",
      );
      document.getElementById("checklist-parecer")?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
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

  const identificacaoComplete =
    Boolean(watch("inspection_date")) &&
    Boolean(watch("inspection_time")) &&
    Boolean(watch("location")?.trim()) &&
    Boolean(watch("inspection_type_id"));

  const veiculoComplete =
    Boolean(watch("plate")?.trim()) &&
    Boolean(watch("chassis")?.trim()) &&
    Boolean(watch("brand")?.trim()) &&
    Boolean(watch("model")?.trim());

  const clienteComplete = Boolean(watch("client_name")?.trim());

  const checklistStatusText =
    checklistItems.length === 0
      ? undefined
      : checklistSummary.pending > 0
        ? `${checklistSummary.pending} pendente(s)`
        : checklistSummary.naoConforme > 0
          ? `${checklistSummary.naoConforme} apontamento(s)`
          : "Concluído";

  const checklistStatusTone =
    checklistSummary.pending > 0
      ? "warning"
      : checklistSummary.evaluated === checklistItems.length
        ? "success"
        : "muted";

  return (
    <form
      ref={formRef}
      onSubmit={(e) => {
        e.preventDefault();
        void validateAndContinue();
      }}
      className="w-full space-y-3 sm:space-y-4"
    >
      <EvaluationSection
        id="avaliacao-identificacao"
        title="Identificação"
        subtitle="Data, hora, local e tipo"
        defaultOpen
        statusText={identificacaoComplete ? "Preenchido" : "Pendente"}
        statusTone={identificacaoComplete ? "success" : "warning"}
      >
        <div className={cn(formGridClass, "gap-y-4")}>
          <FormField label="Data" error={errors.inspection_date?.message}>
            <Input type="date" {...register("inspection_date")} />
          </FormField>
          <FormField label="Hora" error={errors.inspection_time?.message}>
            <Input type="time" {...register("inspection_time")} />
          </FormField>
          <FormField
            label="Local"
            error={errors.location?.message}
            className={formGridFullWidthClass}
          >
            <Input {...register("location")} placeholder="Endereço ou referência" />
          </FormField>
          <FormField
            label="Tipo de vistoria"
            error={errors.inspection_type_id?.message}
            className={formGridFullWidthClass}
          >
            <select
              {...register("inspection_type_id")}
              disabled={typesLoading || inspectionTypes.length === 0}
              className={selectInputClass}
            >
              <option value="">
                {typesLoading ? "Carregando..." : "Selecione o tipo"}
              </option>
              {inspectionTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name} · {formatCurrency(type.amount)}
                </option>
              ))}
            </select>
            {selectedType && (
              <p className="mt-1 text-[11px] text-muted-foreground">
                Referência: {formatCurrency(selectedType.amount)}
              </p>
            )}
          </FormField>
        </div>
      </EvaluationSection>

      <EvaluationSection
        id="avaliacao-veiculo"
        title="Veículo"
        subtitle="Placa, chassi e características"
        defaultOpen
        statusText={veiculoComplete ? "Preenchido" : "Pendente"}
        statusTone={veiculoComplete ? "success" : "warning"}
      >
        <PlateLookupHint state={plateLookupState} className="mb-1" />
        <VeiculoForm control={control} register={register} errors={errors} embedded compact />
      </EvaluationSection>

      <EvaluationSection
        id="avaliacao-contratante"
        title="Contratante"
        subtitle="Dados para o laudo"
        statusText={clienteComplete ? "Preenchido" : undefined}
        statusTone={clienteComplete ? "success" : "muted"}
      >
        <ClienteForm control={control} register={register} errors={errors} embedded compact />
      </EvaluationSection>

      <EvaluationSection
        id="avaliacao-complementares"
        title="Informações complementares"
        subtitle="Venda, justiça e mercado"
        optional
      >
        <div className={cn(formGridClass, "gap-y-4")}>
          <FormField label="Comprador" error={errors.buyer_name?.message} optional>
            <Input {...register("buyer_name")} placeholder="Nome ou razão social" />
          </FormField>
          <FormField label="CPF/CNPJ comprador" error={errors.buyer_document?.message} optional>
            <Input {...register("buyer_document")} />
          </FormField>
          <FormField label="Vendedor" error={errors.seller_name?.message} optional>
            <Input {...register("seller_name")} placeholder="Nome ou razão social" />
          </FormField>
          <FormField label="CPF/CNPJ vendedor" error={errors.seller_document?.message} optional>
            <Input {...register("seller_document")} />
          </FormField>
          <FormField label="Processo judicial" error={errors.judicial_process?.message} optional>
            <Input {...register("judicial_process")} placeholder="Número do processo" />
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
          <FormField
            label="Aceitação seguro (%)"
            error={errors.insurance_acceptance_percent?.message}
            optional
          >
            <Input
              type="number"
              inputMode="decimal"
              min={0}
              max={100}
              {...register("insurance_acceptance_percent")}
            />
          </FormField>
        </div>
      </EvaluationSection>

      <EvaluationSection
        id="avaliacao-checklist"
        title="Checklist técnico"
        subtitle="Avalie cada item do veículo"
        defaultOpen
        statusText={checklistStatusText}
        statusTone={checklistStatusTone}
      >
        {isLoadingChecklist ? (
          <LoadingSpinner label="Carregando checklist..." />
        ) : checklistItems.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Nenhum item encontrado. Recarregue a página.
          </p>
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
        errors={parecerErrors}
        disabled={isSaving}
        variant="compact"
      />

      <div className="border-t border-border pt-4">
        {wizardMode ? (
          <WizardNavButtons
            onBack={onBack}
            onNext={() => void validateAndContinue()}
            nextLabel="Revisar e gerar laudo"
            nextDisabled={isSaving || isSubmitting}
            nextLoading={isSaving || isSubmitting}
          />
        ) : (
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
            {onBack && (
              <Button type="button" variant="outline" className="touch-target" onClick={onBack}>
                Voltar
              </Button>
            )}
            <Button
              type="submit"
              className="h-12 w-full touch-target sm:ml-auto sm:w-auto sm:min-w-[220px]"
              disabled={isSaving || isSubmitting}
            >
              <FileText className="mr-2 h-5 w-5" />
              {isSaving || isSubmitting ? "Salvando..." : "Revisar e gerar laudo"}
            </Button>
          </div>
        )}
      </div>
    </form>
  );
}
