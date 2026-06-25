import type { Control, FieldErrors } from "react-hook-form";
import type { VistoriaInput } from "@/schemas/vistoria";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/forms/form-field";
import { MaskedField, OptionalMaskedField } from "@/components/forms/masked-fields";
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
        label="Nome completo ou razão social"
        error={errors.client_name?.message}
        className={formGridFullWidthClass}
        hint="Como consta no documento do cliente"
      >
        <Input {...register("client_name")} placeholder="Ex.: João da Silva" autoComplete="name" />
      </FormField>

      <MaskedField
        control={control}
        name="client_document"
        label="CPF ou CNPJ"
        mask="cpfCnpj"
        error={errors.client_document?.message}
        placeholder="000.000.000-00"
        hint="Documento principal do cliente"
      />

      <OptionalMaskedField
        control={control}
        name="client_phone"
        label="Telefone"
        mask="phone"
        error={errors.client_phone?.message}
        placeholder="(00) 00000-0000"
        naLabel="Cliente sem telefone"
      />

      <OptionalMaskedField
        control={control}
        name="client_email"
        label="E-mail"
        error={errors.client_email?.message}
        placeholder="cliente@email.com"
        naLabel="Cliente sem e-mail"
        className={formGridFullWidthClass}
      />
    </div>
  );

  if (embedded) return fields;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Cliente</CardTitle>
      </CardHeader>
      <CardContent>{fields}</CardContent>
    </Card>
  );
}
