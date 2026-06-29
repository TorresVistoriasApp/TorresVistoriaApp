import { useEffect, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { vistoriaSchema, vistoriaDraftSchema, type VistoriaInput } from "@/schemas/vistoria";
import {
  InspectionOpinion,
  InspectionSituation,
  InspectionStatus,
} from "@/lib/enums";
import { useInspectionTypes } from "@/hooks/use-inspection-types";
import { formatCurrency } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MaskedInput } from "@/components/ui/masked-input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClienteForm } from "@/components/forms/cliente-form";
import { VeiculoForm } from "@/components/forms/veiculo-form";
import { FormField } from "@/components/forms/form-field";
import { FormFieldGroup } from "@/components/forms/form-field-group";
import { FormSectionCard } from "@/components/forms/form-section-card";
import { maskCurrency } from "@/lib/masks";
import {
  formGridClass,
  formGridFullWidthClass,
  selectInputClass,
  textareaInputClass,
} from "@/lib/form-styles";
import { cn } from "@/lib/utils";

const opinionOptions = Object.values(InspectionOpinion);

const OPINION_LABELS: Record<InspectionOpinion, string> = {
  [InspectionOpinion.APROVADO]: "Aprovado",
  [InspectionOpinion.APROVADO_COM_OBSERVACOES]: "Aprovado com observações",
  [InspectionOpinion.REPROVADO]: "Reprovado",
};

interface VistoriaFormProps {
  defaultValues?: Partial<VistoriaInput>;
  onSubmit: (data: VistoriaInput) => Promise<void>;
  submitLabel?: string;
  showInternalNotes?: boolean;
  wizardMode?: boolean;
  onBack?: () => void;
  backLabel?: string;
  formId?: string;
  stickyActions?: boolean;
  enableAutoSave?: boolean;
  onAutoSave?: (data: Partial<VistoriaInput>) => void;
}

export function VistoriaForm({
  defaultValues,
  onSubmit,
  submitLabel = "Salvar",
  showInternalNotes = false,
  wizardMode = false,
  onBack,
  backLabel = "Voltar",
  formId,
  stickyActions = false,
  enableAutoSave = false,
  onAutoSave,
}: VistoriaFormProps) {
  const { data: inspectionTypes = [], isLoading: typesLoading } = useInspectionTypes(true);
  const formRef = useRef<HTMLFormElement>(null);
  const {
    register,
    control,
    watch,
    getValues,
    setError,
    formState: { errors, isSubmitting, submitCount },
  } = useForm<VistoriaInput>({
    resolver: zodResolver(enableAutoSave ? vistoriaDraftSchema : vistoriaSchema),
    defaultValues: {
      inspection_date: new Date().toISOString().slice(0, 10),
      inspection_time: new Date().toTimeString().slice(0, 5),
      situation: InspectionSituation.PARTICULAR,
      status: InspectionStatus.DRAFT,
      client_phone: "",
      client_email: "",
      renavam: "",
      version: "",
      ...defaultValues,
    },
  });

  const selectedTypeId = watch("inspection_type_id");
  const selectedType = inspectionTypes.find((type) => type.id === selectedTypeId);
  const onAutoSaveRef = useRef(onAutoSave);
  onAutoSaveRef.current = onAutoSave;

  useEffect(() => {
    if (submitCount === 0 || Object.keys(errors).length === 0) return;
    const firstError = formRef.current?.querySelector("[role='alert'], .text-destructive");
    firstError?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [submitCount, errors]);

  useEffect(() => {
    if (!enableAutoSave) return;

    const subscription = watch((values) => {
      onAutoSaveRef.current?.(values as Partial<VistoriaInput>);
    });

    return () => subscription.unsubscribe();
  }, [enableAutoSave, watch]);

  const handleValidatedSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const values = getValues();
    const parsed = vistoriaSchema.safeParse(values);

    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (typeof field === "string") {
          setError(field as keyof VistoriaInput, { message: issue.message });
        }
      }
      return;
    }

    await onSubmit(parsed.data);
  };

  const identificacaoFields = (
    <div className="space-y-6 sm:space-y-8 lg:space-y-6">
      <FormFieldGroup title="Quando e onde" description="Momento e local da realização da vistoria">
        <FormField label="Data" error={errors.inspection_date?.message}>
          <Input type="date" {...register("inspection_date")} />
        </FormField>
        <FormField label="Hora" error={errors.inspection_time?.message}>
          <Input type="time" {...register("inspection_time")} />
        </FormField>
        <FormField
          label="Local da vistoria"
          error={errors.location?.message}
          className={formGridFullWidthClass}
          hint="Endereço, referência ou nome do local"
          >
          <Input {...register("location")} placeholder="Rua, número, bairro, cidade" />
        </FormField>
      </FormFieldGroup>

      <FormFieldGroup
        title="Tipo de vistoria"
        description="Classificação do serviço"
        bordered
      >
        <FormField
          label="Tipo"
          error={errors.inspection_type_id?.message}
          className={formGridFullWidthClass}
        >
          <select
            {...register("inspection_type_id")}
            disabled={typesLoading || inspectionTypes.length === 0}
            className={selectInputClass}
          >
            <option value="">
              {typesLoading ? "Carregando tipos..." : "Selecione o tipo de vistoria"}
            </option>
            {inspectionTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}, {formatCurrency(type.amount)}
              </option>
            ))}
          </select>
          {inspectionTypes.length === 0 && !typesLoading && (
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Cadastre tipos de vistoria em Configurações antes de continuar.
            </p>
          )}
          {selectedType && (
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Referência interna: {formatCurrency(selectedType.amount)}. Não aparece no laudo PDF.
            </p>
          )}
        </FormField>
      </FormFieldGroup>

      <FormField
        label="Indicado por"
        error={errors.requester_name?.message}
        optional
        hint="Se preenchido, entra no laudo. Deixe em branco se não houver indicador."
        className={formGridFullWidthClass}
      >
        <Input {...register("requester_name")} placeholder="Nome do indicador" />
      </FormField>
    </div>
  );

  const vendaMercadoFields = (
    <div className="space-y-6 sm:space-y-8 lg:space-y-6">
      <FormFieldGroup title="Partes envolvidas" description="Comprador e vendedor, se aplicável">
        <FormField label="Comprador" error={errors.buyer_name?.message} optional>
          <Input {...register("buyer_name")} placeholder="Nome ou razão social" />
        </FormField>
        <FormField label="CPF/CNPJ do comprador" error={errors.buyer_document?.message} optional>
          <Input {...register("buyer_document")} placeholder="Documento do comprador" />
        </FormField>
        <FormField label="Vendedor" error={errors.seller_name?.message} optional>
          <Input {...register("seller_name")} placeholder="Nome ou razão social" />
        </FormField>
        <FormField label="CPF/CNPJ do vendedor" error={errors.seller_document?.message} optional>
          <Input {...register("seller_document")} placeholder="Documento do vendedor" />
        </FormField>
      </FormFieldGroup>

      <FormFieldGroup title="Justiça e mercado" description="Processos judiciais e referências de valor" bordered>
        <FormField label="Processo judicial" error={errors.judicial_process?.message} optional>
          <Input {...register("judicial_process")} placeholder="Número do processo, se houver" />
        </FormField>
        <FormField label="Vara ou órgão" error={errors.judicial_court?.message} optional>
          <Input {...register("judicial_court")} placeholder="Vara, comarca ou órgão" />
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
          label="Aceitação do seguro (%)"
          error={errors.insurance_acceptance_percent?.message}
          optional
        >
          <Input
            type="number"
            inputMode="decimal"
            min={0}
            max={100}
            {...register("insurance_acceptance_percent")}
            placeholder="0 a 100"
          />
        </FormField>
      </FormFieldGroup>
    </div>
  );

  const parecerFields = (
    <div className={formGridClass}>
      <FormField
        label="Parecer técnico"
        error={errors.opinion?.message}
        className={formGridFullWidthClass}
        hint="Resultado final da vistoria, exibido em destaque no laudo"
      >
        <select {...register("opinion")} className={selectInputClass}>
          <option value="">Selecione o parecer</option>
          {opinionOptions.map((o) => (
            <option key={o} value={o}>
              {OPINION_LABELS[o]}
            </option>
          ))}
        </select>
      </FormField>
      <FormField
        label="Observações técnicas"
        error={errors.technical_notes?.message}
        className={formGridFullWidthClass}
        hint="Descreva achados, apontamentos ou recomendações. Entra no laudo PDF."
      >
        <textarea
          {...register("technical_notes")}
          rows={5}
          placeholder="Ex.: Pintura original na lateral direita, pneus com desgaste irregular..."
          className={textareaInputClass}
        />
      </FormField>
      {showInternalNotes && (
        <FormField
          label="Comentários internos (admin)"
          error={errors.internal_notes?.message}
          className={formGridFullWidthClass}
          optional
        >
          <textarea {...register("internal_notes")} rows={4} className={textareaInputClass} />
        </FormField>
      )}
    </div>
  );

  const wizardContent = (
    <>
      <FormSectionCard
        id="wizard-identificacao"
        index={1}
        title="Identificação"
        description="Data, local e tipo da vistoria"
      >
        {identificacaoFields}
      </FormSectionCard>

      <FormSectionCard
        id="wizard-cliente"
        index={2}
        title="Contratante"
        description="Pessoa ou empresa que contrata a vistoria. Esses dados entram no laudo."
      >
        <ClienteForm control={control} register={register} errors={errors} embedded />
      </FormSectionCard>

      <FormSectionCard
        id="wizard-veiculo"
        index={3}
        title="Veículo"
        description="Identificação e características do veículo vistoriado"
      >
        <VeiculoForm control={control} register={register} errors={errors} embedded />
      </FormSectionCard>

      <FormSectionCard
        id="wizard-venda"
        index={4}
        title="Venda, justiça e mercado"
        description="Comprador, vendedor, processo judicial e referências de valor"
        optional
        collapsible
        defaultOpen={false}
      >
        {vendaMercadoFields}
      </FormSectionCard>

      <FormSectionCard
        id="wizard-parecer"
        index={5}
        title="Parecer"
        description="Conclusão técnica da vistoria, com resultado e observações no laudo"
      >
        {parecerFields}
      </FormSectionCard>
    </>
  );

  const standardContent = (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Identificação</CardTitle>
        </CardHeader>
        <CardContent>{identificacaoFields}</CardContent>
      </Card>

      <ClienteForm control={control} register={register} errors={errors} />
      <VeiculoForm control={control} register={register} errors={errors} />

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Venda, justiça e mercado</CardTitle>
        </CardHeader>
        <CardContent>{vendaMercadoFields}</CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Parecer</CardTitle>
        </CardHeader>
        <CardContent>{parecerFields}</CardContent>
      </Card>
    </>
  );

  const wizardActionBar = (
    <div
      className={cn(
        "mt-2 flex flex-col-reverse gap-3 border-t border-border pt-5 sm:hidden",
        "max-sm:sticky max-sm:bottom-20 max-sm:z-10 max-sm:-mx-4 max-sm:border-border/60 max-sm:bg-background/95 max-sm:px-4 max-sm:py-4 max-sm:backdrop-blur-md",
      )}
    >
      {onBack ? (
        <Button
          type="button"
          variant="outline"
          className="touch-target w-full sm:w-auto"
          onClick={onBack}
          disabled={isSubmitting}
        >
          {backLabel}
        </Button>
      ) : (
        <div className="hidden sm:block" />
      )}
      <Button
        type="submit"
        className="touch-target w-full sm:min-w-[220px] sm:w-auto"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Salvando..." : submitLabel}
      </Button>
    </div>
  );

  const standardActionBar = onBack ? (
    <div
      className={cn(
        "flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-between",
        stickyActions &&
          "max-sm:sticky max-sm:bottom-20 max-sm:z-10 max-sm:-mx-4 max-sm:border-border/60 max-sm:bg-background/95 max-sm:px-4 max-sm:py-4 max-sm:backdrop-blur-md sm:hidden",
      )}
    >
      <Button
        type="button"
        variant="outline"
        className="touch-target w-full sm:w-auto"
        onClick={onBack}
        disabled={isSubmitting}
      >
        {backLabel}
      </Button>
      <Button
        type="submit"
        className="touch-target w-full sm:min-w-[200px] sm:w-auto"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Salvando..." : submitLabel}
      </Button>
    </div>
  ) : (
    <Button type="submit" className="w-full touch-target sm:w-auto" disabled={isSubmitting}>
      {isSubmitting ? "Salvando..." : submitLabel}
    </Button>
  );

  if (wizardMode) {
    return (
      <form
        id={formId}
        ref={formRef}
        onSubmit={handleValidatedSubmit}
        className="w-full space-y-5 sm:space-y-6 lg:space-y-5"
      >
        {wizardContent}
        {wizardActionBar}
      </form>
    );
  }

  return (
    <form
      id={formId}
      ref={formRef}
      onSubmit={handleValidatedSubmit}
      className={cn("min-w-0 w-full space-y-6", stickyActions && "max-sm:pb-2")}
    >
      {standardContent}
      {standardActionBar}
    </form>
  );
}
