import type { Control, FieldErrors } from "react-hook-form";
import type { VistoriaInput } from "@/schemas/vistoria";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/forms/form-field";
import { MaskedField, OptionalMaskedField } from "@/components/forms/masked-fields";
import { Input } from "@/components/ui/input";

export function ClienteForm({
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
        <CardTitle className="text-base">Cliente</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <FormField label="Nome" error={errors.client_name?.message} className="sm:col-span-2">
          <Input {...register("client_name")} placeholder="Nome completo ou razão social" />
        </FormField>

        <MaskedField
          control={control}
          name="client_document"
          label="CPF/CNPJ"
          mask="cpfCnpj"
          error={errors.client_document?.message}
          placeholder="000.000.000-00"
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
          className="sm:col-span-2"
        />
      </CardContent>
    </Card>
  );
}
