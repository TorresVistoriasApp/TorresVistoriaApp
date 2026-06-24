import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { VistoriaInput } from "@/schemas/vistoria";
import { InspectionSituation } from "@/lib/enums";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const situationOptions = Object.values(InspectionSituation);

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

export function VeiculoForm({
  register,
  errors,
}: {
  register: UseFormRegister<VistoriaInput>;
  errors: FieldErrors<VistoriaInput>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Veículo</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <Field label="Placa" error={errors.plate?.message}>
          <Input {...register("plate")} className="uppercase" />
        </Field>
        <Field label="Chassi" error={errors.chassis?.message}>
          <Input {...register("chassis")} className="uppercase" />
        </Field>
        <Field label="Renavam" error={errors.renavam?.message}>
          <Input {...register("renavam")} />
        </Field>
        <Field label="Marca" error={errors.brand?.message}>
          <Input {...register("brand")} />
        </Field>
        <Field label="Modelo" error={errors.model?.message}>
          <Input {...register("model")} />
        </Field>
        <Field label="Versão" error={errors.version?.message}>
          <Input {...register("version")} />
        </Field>
        <Field label="Cor" error={errors.color?.message}>
          <Input {...register("color")} />
        </Field>
        <Field label="Combustível" error={errors.fuel?.message}>
          <Input {...register("fuel")} />
        </Field>
        <Field label="Ano fab." error={errors.manufacture_year?.message}>
          <Input type="number" {...register("manufacture_year")} />
        </Field>
        <Field label="Ano mod." error={errors.model_year?.message}>
          <Input type="number" {...register("model_year")} />
        </Field>
        <Field label="KM" error={errors.mileage?.message}>
          <Input type="number" {...register("mileage")} />
        </Field>
        <Field label="Situação" error={errors.situation?.message}>
          <select
            {...register("situation")}
            className="flex h-11 w-full rounded-md border border-border bg-background px-3 text-sm"
          >
            {situationOptions.map((o) => (
              <option key={o} value={o}>
                {o.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </Field>
      </CardContent>
    </Card>
  );
}
