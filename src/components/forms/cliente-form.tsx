import type { Control, FieldErrors } from "react-hook-form";
import type { VistoriaInput } from "@/schemas/vistoria";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/forms/form-field";
import { OptionalMaskedField } from "@/components/forms/masked-fields";
import { Input } from "@/components/ui/input";
import { formGridClass, formGridFullWidthClass } from "@/lib/form-styles";

export function ClienteForm({
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
    <div className={formGridClass}>
      <FormField
        label="Nome ou razão social"
        error={errors.client_name?.message}
        className={formGridFullWidthClass}
      >
        <Input
          {...register("client_name")}
          placeholder="Nome completo ou empresa"
          autoComplete="name"
        />
      </FormField>

      <OptionalMaskedField
        control={control}
        name="client_document"
        label="CPF/CNPJ"
        mask="cpfCnpj"
        error={errors.client_document?.message}
        placeholder="000.000.000-00"
        naLabel="Não informado"
      />

      <OptionalMaskedField
        control={control}
        name="client_phone"
        label="Telefone"
        mask="phone"
        error={errors.client_phone?.message}
        placeholder="(00) 00000-0000"
        naLabel="Não informado"
      />

      <OptionalMaskedField
        control={control}
        name="client_email"
        label="E-mail"
        error={errors.client_email?.message}
        placeholder="email@exemplo.com"
        naLabel="Não informado"
        className={formGridFullWidthClass}
      />
    </div>
  );

  if (embedded) return fields;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Contratante</CardTitle>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Pessoa ou empresa que contrata a vistoria. Os dados abaixo constam no laudo.
        </p>
      </CardHeader>
      <CardContent>{fields}</CardContent>
    </Card>
  );
}
