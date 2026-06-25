import { Controller, type Control, type FieldErrors } from "react-hook-form";
import type { VistoriaInput } from "@/schemas/vistoria";
import { InspectionSituation } from "@/lib/enums";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/forms/form-field";
import { FormFieldGroup } from "@/components/forms/form-field-group";
import { MaskedField, OptionalMaskedField } from "@/components/forms/masked-fields";
import { YearSelectField } from "@/components/forms/year-select-field";
import { CAR_BRANDS } from "@/lib/vehicle-brands";
import { BRAZILIAN_UFS } from "@/lib/brazilian-ufs";
import { formGridFullWidthClass, selectInputClass } from "@/lib/form-styles";

const situationOptions = Object.values(InspectionSituation);

const SITUATION_LABELS: Record<InspectionSituation, string> = {
  [InspectionSituation.PARTICULAR]: "Particular",
  [InspectionSituation.LOJA]: "Loja / revenda",
  [InspectionSituation.LEILAO]: "Leilão",
  [InspectionSituation.RECUPERADO]: "Recuperado",
  [InspectionSituation.SINISTRADO]: "Sinistrado",
  [InspectionSituation.ALIENADO]: "Alienado",
};

const FUEL_OPTIONS = ["Flex", "Gasolina", "Etanol", "Diesel", "GNV", "Elétrico", "Híbrido"];

const CURRENT_YEAR = new Date().getFullYear();
const MAX_MANUFACTURE_YEAR = CURRENT_YEAR + 1;
const MAX_MODEL_YEAR = CURRENT_YEAR + 2;

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
        title="Identificação"
        description="Conforme placa, chassi e documento do veículo"
      >
        <MaskedField
          control={control}
          name="plate"
          label="Placa"
          mask="plate"
          error={errors.plate?.message}
          placeholder="ABC1D23"
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
          naLabel="Não informado"
        />

        <FormField label="Número do motor" error={errors.motor_number?.message} optional>
          <Input {...register("motor_number")} placeholder="Gravação no motor" className="uppercase" />
        </FormField>
      </FormFieldGroup>

      <FormFieldGroup title="Emplacamento" description="UF e município de registro" bordered>
        <FormField label="UF" error={errors.vehicle_uf?.message}>
          <Controller
            control={control}
            name="vehicle_uf"
            render={({ field }) => (
              <select
                value={field.value ?? ""}
                onChange={(e) => field.onChange(e.target.value || null)}
                className={selectInputClass}
              >
                <option value="">Selecione a UF</option>
                {BRAZILIAN_UFS.map((uf) => (
                  <option key={uf} value={uf}>
                    {uf}
                  </option>
                ))}
              </select>
            )}
          />
        </FormField>

        <FormField label="Município" error={errors.registration_city_uf?.message}>
          <Input {...register("registration_city_uf")} placeholder="Cidade de emplacamento" />
        </FormField>
      </FormFieldGroup>

      <FormFieldGroup title="Características" description="Marca, modelo e acabamento" bordered>
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
          <Input {...register("model")} placeholder="Ex.: Onix, Corolla" />
        </FormField>

        <OptionalMaskedField
          control={control}
          name="version"
          label="Versão"
          error={errors.version?.message}
          placeholder="Ex.: 1.0 LT"
          naLabel="Não informado"
        />

        <FormField label="Cor" error={errors.color?.message}>
          <Input {...register("color")} placeholder="Ex.: Prata" />
        </FormField>

        <FormField label="Combustível" error={errors.fuel?.message}>
          <Controller
            control={control}
            name="fuel"
            render={({ field }) => (
              <select value={field.value ?? ""} onChange={field.onChange} className={selectInputClass}>
                <option value="">Selecione</option>
                {FUEL_OPTIONS.map((fuel) => (
                  <option key={fuel} value={fuel}>
                    {fuel}
                  </option>
                ))}
              </select>
            )}
          />
        </FormField>

        <YearSelectField
          control={control}
          name="manufacture_year"
          label="Ano de fabricação"
          error={errors.manufacture_year?.message}
          maxYear={MAX_MANUFACTURE_YEAR}
        />

        <YearSelectField
          control={control}
          name="model_year"
          label="Ano modelo"
          error={errors.model_year?.message}
          maxYear={MAX_MODEL_YEAR}
        />
      </FormFieldGroup>

      <FormFieldGroup
        title="Complementos"
        description="Informações adicionais para o laudo"
        bordered
      >
        <FormField label="Categoria" error={errors.vehicle_category?.message} optional>
          <Input {...register("vehicle_category")} placeholder="Ex.: Particular" />
        </FormField>

        <FormField label="Espécie" error={errors.vehicle_species?.message} optional>
          <Input {...register("vehicle_species")} placeholder="Ex.: Passageiro" />
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
            <FormField label="Quilometragem" error={errors.mileage?.message} optional>
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
                placeholder="Km atual"
              />
            </FormField>
          )}
        />

        <FormField
          label="Situação"
          error={errors.situation?.message}
          className={formGridFullWidthClass}
        >
          <select {...register("situation")} className={selectInputClass}>
            {situationOptions.map((o) => (
              <option key={o} value={o}>
                {SITUATION_LABELS[o]}
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
        <p className="text-xs leading-relaxed text-muted-foreground">
          Dados do veículo vistoriado conforme documento e CRLV.
        </p>
      </CardHeader>
      <CardContent>{fields}</CardContent>
    </Card>
  );
}
