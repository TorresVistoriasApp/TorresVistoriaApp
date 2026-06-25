import { Controller, type Control, type FieldErrors } from "react-hook-form";
import type { VistoriaInput } from "@/schemas/vistoria";
import { InspectionSituation } from "@/lib/enums";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/forms/form-field";
import { FormFieldGroup } from "@/components/forms/form-field-group";
import { MaskedField, OptionalMaskedField } from "@/components/forms/masked-fields";
import { CAR_BRANDS } from "@/lib/vehicle-brands";
import { formGridFullWidthClass, selectInputClass } from "@/lib/form-styles";

const situationOptions = Object.values(InspectionSituation);

const FUEL_OPTIONS = ["Flex", "Gasolina", "Etanol", "Diesel", "GNV", "Elétrico", "Híbrido"];

export function VeiculoForm({
  control,
  register,
  errors,
  embedded = false,
}: {
  control: Control<VistoriaInput>;
  register: ReturnType<typeof import("react-hook-form").useForm<VistoriaInput>>["register"];
  errors: FieldErrors<VistoriaInput>;
  embedded?: boolean;
}) {
  const fields = (
    <div className="space-y-6 sm:space-y-8 lg:space-y-6">
      <FormFieldGroup
        title="Registro e numeração"
        description="Dados oficiais de identificação do veículo"
      >
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

        <FormField label="Número do motor" error={errors.motor_number?.message} optional>
          <Input
            {...register("motor_number")}
            placeholder="Gravação no bloco do motor"
            className="uppercase"
          />
        </FormField>
      </FormFieldGroup>

      <FormFieldGroup
        title="Emplacamento"
        description="Local de registro do veículo"
        bordered
      >
        <FormField label="UF do veículo" error={errors.vehicle_uf?.message}>
          <Input
            {...register("vehicle_uf")}
            placeholder="Ex.: GO"
            maxLength={2}
            className="uppercase"
          />
        </FormField>

        <FormField
          label="Município / UF"
          error={errors.registration_city_uf?.message}
          hint="Cidade e estado do emplacamento"
        >
          <Input {...register("registration_city_uf")} placeholder="Ex.: Goiânia / GO" />
        </FormField>
      </FormFieldGroup>

      <FormFieldGroup
        title="Marca, modelo e acabamento"
        description="Informações visíveis e de catálogo"
        bordered
      >
        <FormField label="Marca" error={errors.brand?.message}>
          <Controller
            control={control}
            name="brand"
            render={({ field }) => {
              const brandOptions =
                field.value && !CAR_BRANDS.includes(field.value as (typeof CAR_BRANDS)[number])
                  ? [field.value, ...CAR_BRANDS]
                  : CAR_BRANDS;

              return (
                <select value={field.value ?? ""} onChange={field.onChange} className={selectInputClass}>
                  <option value="">Selecione a marca</option>
                  {brandOptions.map((brand) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                </select>
              );
            }}
          />
        </FormField>

        <FormField label="Modelo" error={errors.model?.message}>
          <Input {...register("model")} placeholder="Ex.: Onix, HB20, Corolla" />
        </FormField>

        <OptionalMaskedField
          control={control}
          name="version"
          label="Versão"
          error={errors.version?.message}
          placeholder="Ex.: 1.0 MPI LT"
          naLabel="Sem versão informada"
        />

        <FormField label="Cor" error={errors.color?.message}>
          <Input {...register("color")} placeholder="Ex.: Prata, Preto, Branco" />
        </FormField>

        <FormField label="Combustível" error={errors.fuel?.message}>
          <Controller
            control={control}
            name="fuel"
            render={({ field }) => (
              <select value={field.value ?? ""} onChange={field.onChange} className={selectInputClass}>
                <option value="">Selecione o combustível</option>
                {FUEL_OPTIONS.map((fuel) => (
                  <option key={fuel} value={fuel}>
                    {fuel}
                  </option>
                ))}
              </select>
            )}
          />
        </FormField>
      </FormFieldGroup>

      <FormFieldGroup
        title="Especificações técnicas"
        description="Detalhes para o laudo e checklist"
        bordered
      >
        <FormField label="Categoria" error={errors.vehicle_category?.message} optional>
          <Input {...register("vehicle_category")} placeholder="Ex.: Particular, aluguel" />
        </FormField>

        <FormField label="Espécie" error={errors.vehicle_species?.message} optional>
          <Input {...register("vehicle_species")} placeholder="Ex.: Passageiro, carga" />
        </FormField>

        <FormField label="Ano de fabricação" error={errors.manufacture_year?.message}>
          <Input
            type="number"
            inputMode="numeric"
            {...register("manufacture_year")}
            placeholder={String(new Date().getFullYear())}
            min={1900}
            max={new Date().getFullYear() + 1}
          />
        </FormField>

        <FormField label="Ano do modelo" error={errors.model_year?.message}>
          <Input
            type="number"
            inputMode="numeric"
            {...register("model_year")}
            placeholder={String(new Date().getFullYear())}
            min={1900}
            max={new Date().getFullYear() + 2}
          />
        </FormField>

        <FormField label="Lugares" error={errors.passenger_capacity?.message} optional>
          <Input type="number" inputMode="numeric" min={0} max={99} {...register("passenger_capacity")} />
        </FormField>

        <FormField label="Potência (cv)" error={errors.power_cv?.message} optional>
          <Input type="number" inputMode="numeric" min={0} {...register("power_cv")} />
        </FormField>

        <FormField label="Cilindradas (cc)" error={errors.engine_displacement?.message} optional>
          <Input type="number" inputMode="numeric" min={0} {...register("engine_displacement")} />
        </FormField>

        <Controller
          control={control}
          name="mileage"
          render={({ field }) => (
            <FormField label="Quilometragem" error={errors.mileage?.message} hint="Odômetro no momento da vistoria">
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
                placeholder="Ex.: 45.000"
              />
            </FormField>
          )}
        />

        <FormField
          label="Situação do veículo"
          error={errors.situation?.message}
          className={formGridFullWidthClass}
        >
          <select {...register("situation")} className={selectInputClass}>
            {situationOptions.map((o) => (
              <option key={o} value={o}>
                {o.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </FormField>
      </FormFieldGroup>
    </div>
  );

  if (embedded) return fields;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Veículo</CardTitle>
      </CardHeader>
      <CardContent>{fields}</CardContent>
    </Card>
  );
}
