import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { vistoriaSchema, type VistoriaInput } from "@/schemas/vistoria";
import {
  InspectionOpinion,
  InspectionSituation,
  InspectionStatus,
} from "@/lib/enums";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClienteForm } from "@/components/forms/cliente-form";
import { VeiculoForm } from "@/components/forms/veiculo-form";

const opinionOptions = Object.values(InspectionOpinion);

interface VistoriaFormProps {
  defaultValues?: Partial<VistoriaInput>;
  onSubmit: (data: VistoriaInput) => Promise<void>;
  submitLabel?: string;
  showInternalNotes?: boolean;
}

export function VistoriaForm({
  defaultValues,
  onSubmit,
  submitLabel = "Salvar",
  showInternalNotes = false,
}: VistoriaFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<VistoriaInput>({
    resolver: zodResolver(vistoriaSchema),
    defaultValues: {
      inspection_date: new Date().toISOString().slice(0, 10),
      inspection_time: new Date().toTimeString().slice(0, 5),
      situation: InspectionSituation.PARTICULAR,
      status: InspectionStatus.DRAFT,
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Identificação</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Field label="Data" error={errors.inspection_date?.message}>
            <Input type="date" {...register("inspection_date")} />
          </Field>
          <Field label="Hora" error={errors.inspection_time?.message}>
            <Input type="time" {...register("inspection_time")} />
          </Field>
          <Field label="Local" error={errors.location?.message} className="sm:col-span-2">
            <Input {...register("location")} placeholder="Endereço da vistoria" />
          </Field>
        </CardContent>
      </Card>

      <ClienteForm register={register} errors={errors} />

      <VeiculoForm register={register} errors={errors} />

      <Card>
        <CardHeader><CardTitle>Parecer</CardTitle></CardHeader>
        <CardContent className="grid gap-4">
          <Field label="Parecer técnico" error={errors.opinion?.message}>
            <select
              {...register("opinion")}
              className="flex h-11 w-full rounded-md border border-border bg-background px-3 text-sm"
            >
              <option value="">Selecione...</option>
              {opinionOptions.map((o) => (
                <option key={o} value={o}>{o.replace(/_/g, " ")}</option>
              ))}
            </select>
          </Field>
          <Field label="Observações técnicas" error={errors.technical_notes?.message}>
            <textarea
              {...register("technical_notes")}
              rows={4}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
            />
          </Field>
          {showInternalNotes && (
            <Field label="Comentários internos (admin)" error={errors.internal_notes?.message}>
              <textarea
                {...register("internal_notes")}
                rows={3}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
            </Field>
          )}
        </CardContent>
      </Card>

      <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting}>
        {isSubmitting ? "Salvando..." : submitLabel}
      </Button>
    </form>
  );
}

function Field({
  label,
  error,
  children,
  className,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label className="mb-1.5 block">{label}</Label>
      {children}
      {error && <p className="mt-1 text-sm text-destructive">{error}</p>}
    </div>
  );
}
