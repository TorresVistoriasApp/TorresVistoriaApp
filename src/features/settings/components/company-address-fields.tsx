import { useCallback, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import type { Control, UseFormRegister, UseFormSetValue } from "react-hook-form";
import { Controller, useWatch } from "react-hook-form";
import { MaskedInput } from "@/components/ui/masked-input";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetchAddressByCep, normalizeCep } from "@/lib/cep";
import type { CompanyInput } from "@/schemas/settings";

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
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Endereço de referência da empresa no painel. Informe o CEP para preencher rua, bairro e
        cidade automaticamente.
      </p>

      <div className="space-y-2 sm:max-w-xs">
        <Label htmlFor="company-cep">CEP</Label>
        <div className="relative">
          <Controller
            name="address_cep"
            control={control}
            render={({ field }) => (
              <MaskedInput
                id="company-cep"
                mask="cep"
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
        <p className="text-xs text-muted-foreground">
          Com o CEP completo, rua, bairro e cidade são preenchidos automaticamente. Confira o
          número e o complemento.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_120px]">
        <div className="space-y-2">
          <Label htmlFor="company-street">Rua</Label>
          <Input
            id="company-street"
            placeholder="Logradouro"
            disabled={!canEdit}
            {...register("address_street")}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="company-number">Número</Label>
          <Input
            id="company-number"
            placeholder="Nº"
            disabled={!canEdit}
            {...register("address_number")}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="company-complement">Complemento</Label>
        <Input
          id="company-complement"
          placeholder="Sala, bloco, referência"
          disabled={!canEdit}
          {...register("address_complement")}
        />
      </div>

      <div className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Bairro · cidade · estado
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_72px]">
          <div className="space-y-2 sm:col-span-2 lg:col-span-1">
            <Label htmlFor="company-neighborhood">Bairro</Label>
            <Input
              id="company-neighborhood"
              placeholder="Bairro"
              disabled={!canEdit}
              {...register("address_neighborhood")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company-city">Cidade</Label>
            <Input
              id="company-city"
              placeholder="Cidade"
              disabled={!canEdit}
              {...register("address_city")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="company-state">UF</Label>
            <Input
              id="company-state"
              placeholder="UF"
              maxLength={2}
              disabled={!canEdit}
              className="uppercase"
              {...register("address_state", {
                setValueAs: (value: string) => value.toUpperCase(),
              })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
