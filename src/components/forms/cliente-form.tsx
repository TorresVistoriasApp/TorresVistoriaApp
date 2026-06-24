import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { VistoriaInput } from "@/schemas/vistoria";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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

export function ClienteForm({
  register,
  errors,
}: {
  register: UseFormRegister<VistoriaInput>;
  errors: FieldErrors<VistoriaInput>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Cliente</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2">
        <Field label="Nome" error={errors.client_name?.message}>
          <Input {...register("client_name")} />
        </Field>
        <Field label="CPF/CNPJ" error={errors.client_document?.message}>
          <Input {...register("client_document")} />
        </Field>
        <Field label="Telefone" error={errors.client_phone?.message}>
          <Input {...register("client_phone")} />
        </Field>
        <Field label="E-mail" error={errors.client_email?.message}>
          <Input type="email" {...register("client_email")} />
        </Field>
      </CardContent>
    </Card>
  );
}
