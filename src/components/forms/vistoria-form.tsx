import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { vistoriaSchema, type VistoriaInput } from "@/schemas/vistoria";
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
import { maskCurrency } from "@/lib/masks";
import { cn } from "@/lib/utils";

const opinionOptions = Object.values(InspectionOpinion);

interface VistoriaFormProps {
  defaultValues?: Partial<VistoriaInput>;
  onSubmit: (data: VistoriaInput) => Promise<void>;
  submitLabel?: string;
  showInternalNotes?: boolean;
  wizardMode?: boolean;
  onBack?: () => void;
}

export function VistoriaForm({
  defaultValues,
  onSubmit,
  submitLabel = "Salvar",
  showInternalNotes = false,
  wizardMode = false,
  onBack,
}: VistoriaFormProps) {
  const { data: inspectionTypes = [], isLoading: typesLoading } = useInspectionTypes(true);
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<VistoriaInput>({
    resolver: zodResolver(vistoriaSchema),
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

  const formContent = (
    <>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Identificação</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <FormField label="Data" error={errors.inspection_date?.message}>
            <Input type="date" {...register("inspection_date")} />
          </FormField>
          <FormField label="Hora" error={errors.inspection_time?.message}>
            <Input type="time" {...register("inspection_time")} />
          </FormField>
          <FormField
            label="Local"
            error={errors.location?.message}
            className="sm:col-span-2"
            hint="Endereço ou ponto de referência da vistoria"
          >
            <Input {...register("location")} placeholder="Endereço da vistoria" />
          </FormField>
          <FormField label="Tipo de vistoria" error={errors.inspection_type_id?.message}>
            <select
              {...register("inspection_type_id")}
              disabled={typesLoading || inspectionTypes.length === 0}
              className={cn(
                "flex h-11 w-full rounded-xl border border-border bg-card px-4 text-sm shadow-soft",
                "focus-visible:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
                "disabled:cursor-not-allowed disabled:opacity-60",
              )}
            >
              <option value="">
                {typesLoading ? "Carregando tipos..." : "Selecione o tipo de vistoria"}
              </option>
              {inspectionTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name} — {formatCurrency(type.amount)}
                </option>
              ))}
            </select>
            {inspectionTypes.length === 0 && !typesLoading && (
              <p className="mt-1 text-xs text-muted-foreground">
                Cadastre tipos de vistoria em Configurações antes de continuar.
              </p>
            )}
            {selectedType && (
              <p className="mt-1 text-xs text-muted-foreground">
                Valor de referência interna: {formatCurrency(selectedType.amount)} (não aparece no PDF).
              </p>
            )}
          </FormField>
          <FormField label="Solicitante" error={errors.requester_name?.message}>
            <Input {...register("requester_name")} placeholder="Nome de quem solicitou a vistoria" />
          </FormField>
        </CardContent>
      </Card>

      <ClienteForm control={control} register={register} errors={errors} />
      <VeiculoForm control={control} register={register} errors={errors} />

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Venda, justiça e mercado</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <FormField label="Comprador" error={errors.buyer_name?.message}>
            <Input {...register("buyer_name")} placeholder="Nome ou razão social" />
          </FormField>
          <FormField label="CPF/CNPJ comprador" error={errors.buyer_document?.message}>
            <Input {...register("buyer_document")} placeholder="Documento do comprador" />
          </FormField>
          <FormField label="Vendedor" error={errors.seller_name?.message}>
            <Input {...register("seller_name")} placeholder="Nome ou razão social" />
          </FormField>
          <FormField label="CPF/CNPJ vendedor" error={errors.seller_document?.message}>
            <Input {...register("seller_document")} placeholder="Documento do vendedor" />
          </FormField>
          <FormField label="Processo judicial" error={errors.judicial_process?.message}>
            <Input {...register("judicial_process")} placeholder="Número do processo, se houver" />
          </FormField>
          <FormField label="Vara / órgão" error={errors.judicial_court?.message}>
            <Input {...register("judicial_court")} placeholder="Vara, comarca ou órgão solicitante" />
          </FormField>
          <FormField label="Valor FIPE" error={errors.market_fipe_value?.message}>
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
                  placeholder="R$ 0"
                />
              )}
            />
          </FormField>
          <FormField label="Aceitação seguro (%)" error={errors.insurance_acceptance_percent?.message}>
            <Input type="number" min={0} max={100} {...register("insurance_acceptance_percent")} />
          </FormField>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Parecer</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <FormField label="Parecer técnico" error={errors.opinion?.message}>
            <select
              {...register("opinion")}
              className={cn(
                "flex h-11 w-full rounded-xl border border-border bg-card px-4 text-sm shadow-soft",
                "focus-visible:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
              )}
            >
              <option value="">Selecione...</option>
              {opinionOptions.map((o) => (
                <option key={o} value={o}>
                  {o.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Observações técnicas" error={errors.technical_notes?.message}>
            <textarea
              {...register("technical_notes")}
              rows={4}
              placeholder="Descreva achados relevantes, ressalvas ou recomendações..."
              className={cn(
                "w-full rounded-xl border border-border bg-card px-4 py-3 text-sm shadow-soft",
                "focus-visible:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
              )}
            />
          </FormField>
          {showInternalNotes && (
            <FormField label="Comentários internos (admin)" error={errors.internal_notes?.message}>
              <textarea
                {...register("internal_notes")}
                rows={3}
                className={cn(
                  "w-full rounded-xl border border-border bg-card px-4 py-3 text-sm shadow-soft",
                  "focus-visible:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
                )}
              />
            </FormField>
          )}
        </CardContent>
      </Card>
    </>
  );

  if (wizardMode) {
    return (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {formContent}
        <div className="flex flex-col-reverse gap-3 border-t border-border pt-4 sm:flex-row sm:justify-between">
          {onBack ? (
            <Button type="button" variant="outline" className="touch-target" onClick={onBack}>
              Voltar
            </Button>
          ) : (
            <div />
          )}
          <Button type="submit" className="touch-target sm:min-w-[200px]" disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : submitLabel}
          </Button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {formContent}
      <Button type="submit" className="w-full touch-target sm:w-auto" disabled={isSubmitting}>
        {isSubmitting ? "Salvando..." : submitLabel}
      </Button>
    </form>
  );
}
