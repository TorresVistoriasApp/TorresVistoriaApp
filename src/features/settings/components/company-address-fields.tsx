import { useCallback, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import type { Control, UseFormRegister, UseFormSetValue } from "react-hook-form";
import { Controller, useWatch } from "react-hook-form";
import { MaskedInput } from "@/components/ui/masked-input";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/forms/form-field";
import { fetchAddressByCep, normalizeCep } from "@/lib/cep";
import type { CompanyInput } from "@/schemas/settings";
import {
  SETTINGS_FIELD_LABEL_CLASS,
  SettingsSubheading,
} from "@/features/settings/components/settings-section";

type CompanyAddressFieldsProps = {
  control: Control<CompanyInput>;
  register: UseFormRegister<CompanyInput>;
  setValue: UseFormSetValue<CompanyInput>;
  canEdit: boolean;
  onCepError?: (message: string) => void;
};

export function CompanyAddressFields({
  control,
  register,
  setValue,
  canEdit,
  onCepError,
}: CompanyAddressFieldsProps) {
  const [cepLoading, setCepLoading] = useState(false);
  const lastFetchedCep = useRef<string | null>(null);
  const currentComplement = useWatch({ control, name: "address_complement" });

  const lookupCep = useCallback(
    async (rawCep: string) => {
      const digits = normalizeCep(rawCep);
      if (digits.length !== 8 || !canEdit) return;
      if (lastFetchedCep.current === digits) return;

      setCepLoading(true);
      try {
        const result = await fetchAddressByCep(digits);
        if (!result) {
          onCepError?.("CEP não encontrado. Verifique o número informado.");
          return;
        }

        lastFetchedCep.current = digits;
        setValue("address_cep", result.cep, { shouldDirty: true });
        if (result.street) setValue("address_street", result.street, { shouldDirty: true });
        if (result.neighborhood) {
          setValue("address_neighborhood", result.neighborhood, { shouldDirty: true });
        }
        if (result.city) setValue("address_city", result.city, { shouldDirty: true });
        if (result.state) setValue("address_state", result.state, { shouldDirty: true });

        if (result.complement && !currentComplement?.trim()) {
          setValue("address_complement", result.complement, { shouldDirty: true });
        }
      } catch (error) {
        onCepError?.(error instanceof Error ? error.message : "Erro ao consultar CEP");
      } finally {
        setCepLoading(false);
      }
    },
    [canEdit, currentComplement, onCepError, setValue],
  );

  return (
    <div className="space-y-6">
      <p className="text-sm leading-relaxed text-muted-foreground">
        Informe o endereço completo da sede ou ponto de atendimento. O CEP preenche automaticamente
        logradouro, bairro e município.
      </p>

      <FormField
        label="CEP"
        labelClassName={SETTINGS_FIELD_LABEL_CLASS}
        hint="Após informar os oito dígitos, os demais campos serão sugeridos automaticamente."
        className="min-w-0 sm:max-w-xs"
      >
        <div className="relative">
          <Controller
            name="address_cep"
            control={control}
            render={({ field }) => (
              <MaskedInput
                id="company-cep"
                mask="cep"
                className="touch-target"
                placeholder="00000-000"
                disabled={!canEdit || cepLoading}
                value={field.value ?? ""}
                onChange={(value) => {
                  field.onChange(value);
                  if (normalizeCep(value).length === 8) {
                    void lookupCep(value);
                  }
                }}
                onBlur={() => {
                  field.onBlur();
                  void lookupCep(field.value ?? "");
                }}
              />
            )}
          />
          {cepLoading && (
            <Loader2
              className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground"
              aria-hidden
            />
          )}
        </div>
      </FormField>

      <div className="grid min-w-0 gap-5 sm:grid-cols-[minmax(0,1fr)_120px]">
        <FormField label="Logradouro" labelClassName={SETTINGS_FIELD_LABEL_CLASS} className="min-w-0">
          <Input
            id="company-street"
            className="touch-target"
            placeholder="Rua, avenida ou travessa"
            disabled={!canEdit}
            {...register("address_street")}
          />
        </FormField>
        <FormField label="Número" labelClassName={SETTINGS_FIELD_LABEL_CLASS} className="min-w-0">
          <Input
            id="company-number"
            className="touch-target"
            placeholder="Nº"
            disabled={!canEdit}
            {...register("address_number")}
          />
        </FormField>
      </div>

      <FormField
        label="Complemento"
        labelClassName={SETTINGS_FIELD_LABEL_CLASS}
        hint="Opcional. Sala, bloco, andar ou ponto de referência."
        className="min-w-0"
      >
        <Input
          id="company-complement"
          className="touch-target"
          placeholder="Ex.: Sala 12, Bloco B"
          disabled={!canEdit}
          {...register("address_complement")}
        />
      </FormField>

      <div className="space-y-4">
        <SettingsSubheading>Localidade</SettingsSubheading>
        <div className="grid min-w-0 gap-5 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_88px]">
          <FormField
            label="Bairro"
            labelClassName={SETTINGS_FIELD_LABEL_CLASS}
            className="min-w-0 sm:col-span-2 lg:col-span-1"
          >
            <Input
              id="company-neighborhood"
              className="touch-target"
              placeholder="Bairro"
              disabled={!canEdit}
              {...register("address_neighborhood")}
            />
          </FormField>
          <FormField label="Cidade" labelClassName={SETTINGS_FIELD_LABEL_CLASS} className="min-w-0">
            <Input
              id="company-city"
              className="touch-target"
              placeholder="Município"
              disabled={!canEdit}
              {...register("address_city")}
            />
          </FormField>
          <FormField label="UF" labelClassName={SETTINGS_FIELD_LABEL_CLASS} className="min-w-0">
            <Input
              id="company-state"
              className="touch-target uppercase"
              placeholder="UF"
              maxLength={2}
              disabled={!canEdit}
              {...register("address_state", {
                setValueAs: (value: string) => value.toUpperCase(),
              })}
            />
          </FormField>
        </div>
      </div>
    </div>
  );
}
