import { Controller, type Control, type FieldErrors } from "react-hook-form";
import type { VistoriaInput } from "@/schemas/vistoria";
import { InspectionSituation } from "@/lib/enums";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/forms/form-field";
import { MaskedField, OptionalMaskedField } from "@/components/forms/masked-fields";
import { cn } from "@/lib/utils";

const situationOptions = Object.values(InspectionSituation);

const FUEL_OPTIONS = ["Flex", "Gasolina", "Etanol", "Diesel", "GNV", "Elétrico", "Híbrido"];

export function VeiculoForm({
  control,
  register,
  errors,
}: {
  control: Control<VistoriaInput>;
  register: ReturnType<typeof import("react-hook-form").useForm<VistoriaInput>>["register"];
  errors: FieldErrors<VistoriaInput>;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Veículo</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <MaskedField
          control={control}
          name="plate"
          label="Placa"
          mask="plate"
          error={errors.plate?.message}
          placeholder="ABC-1D23"
          inputClassName="uppercase font-mono tracking-wider"
        />

        <MaskedField
          control={control}
          name="chassis"
          label="Chassi"
          mask="chassis"
          error={errors.chassis?.message}
          placeholder="17 caracteres"
          inputClassName="uppercase font-mono text-xs"
        />

        <OptionalMaskedField
          control={control}
          name="renavam"
          label="Renavam"
          mask="renavam"
          error={errors.renavam?.message}
          placeholder="00000000000"
          naLabel="Veículo sem Renavam"
        />

        <FormField label="Número do motor" error={errors.motor_number?.message}>
          <Input {...register("motor_number")} placeholder="Numeração gravada no motor" className="uppercase" />
        </FormField>

        <FormField label="UF veículo" error={errors.vehicle_uf?.message}>
          <Input {...register("vehicle_uf")} placeholder="GO" maxLength={2} className="uppercase" />
        </FormField>

        <FormField label="Município/UF emplacamento" error={errors.registration_city_uf?.message}>
          <Input {...register("registration_city_uf")} placeholder="Brasília / DF" />
        </FormField>

        <FormField label="Marca" error={errors.brand?.message}>
          <Input {...register("brand")} placeholder="Ex.: Volkswagen" />
        </FormField>

        <FormField label="Modelo" error={errors.model?.message}>
          <Input {...register("model")} placeholder="Ex.: Gol" />
        </FormField>

        <OptionalMaskedField
          control={control}
          name="version"
          label="Versão"
          error={errors.version?.message}
          placeholder="Ex.: 1.0 MPI"
          naLabel="Sem versão informada"
        />

        <FormField label="Cor" error={errors.color?.message}>
          <Input {...register("color")} placeholder="Ex.: Prata" />
        </FormField>

        <FormField label="Combustível" error={errors.fuel?.message}>
          <Controller
            control={control}
            name="fuel"
            render={({ field }) => (
              <select
                value={field.value ?? ""}
                onChange={field.onChange}
                className={cn(
                  "flex h-11 w-full rounded-xl border border-border bg-card px-4 text-sm shadow-soft",
                  "focus-visible:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
                )}
              >
                <option value="">Selecione...</option>
                {FUEL_OPTIONS.map((fuel) => (
                  <option key={fuel} value={fuel}>
                    {fuel}
                  </option>
                ))}
              </select>
            )}
          />
        </FormField>

        <FormField label="Categoria" error={errors.vehicle_category?.message}>
          <Input {...register("vehicle_category")} placeholder="Ex.: Particular, aluguel, oficial" />
        </FormField>

        <FormField label="Espécie" error={errors.vehicle_species?.message}>
          <Input {...register("vehicle_species")} placeholder="Ex.: Passageiro, carga, misto" />
        </FormField>

        <FormField label="Ano fab." error={errors.manufacture_year?.message}>
          <Input
            type="number"
            {...register("manufacture_year")}
            placeholder={String(new Date().getFullYear())}
            min={1900}
            max={new Date().getFullYear() + 1}
          />
        </FormField>

        <FormField label="Ano mod." error={errors.model_year?.message}>
          <Input
            type="number"
            {...register("model_year")}
            placeholder={String(new Date().getFullYear())}
            min={1900}
            max={new Date().getFullYear() + 2}
          />
        </FormField>

        <FormField label="Passageiros" error={errors.passenger_capacity?.message}>
          <Input type="number" min={0} max={99} {...register("passenger_capacity")} />
        </FormField>

        <FormField label="Potência (cv)" error={errors.power_cv?.message}>
          <Input type="number" min={0} {...register("power_cv")} />
        </FormField>

        <FormField label="Cilindradas" error={errors.engine_displacement?.message}>
          <Input type="number" min={0} {...register("engine_displacement")} />
        </FormField>

        <Controller
          control={control}
          name="mileage"
          render={({ field }) => (
            <FormField label="KM" error={errors.mileage?.message}>
              <Input
                inputMode="numeric"
                value={
                  field.value != null
                    ? new Intl.NumberFormat("pt-BR").format(Number(field.value))
                    : ""
                }
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, "").slice(0, 7);
                  field.onChange(digits ? Number(digits) : null);
                }}
                placeholder="0"
              />
            </FormField>
          )}
        />

        <FormField label="Situação" error={errors.situation?.message}>
          <select
            {...register("situation")}
            className={cn(
              "flex h-11 w-full rounded-xl border border-border bg-card px-4 text-sm shadow-soft",
              "focus-visible:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
            )}
          >
            {situationOptions.map((o) => (
              <option key={o} value={o}>
                {o.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </FormField>
      </CardContent>
    </Card>
  );
}
