import type { ComponentProps } from "react";
import { Input } from "@/shared/ui/input";
import { FormField } from "@/shared/components/forms/form-field";

type ConfirmPasswordFieldProps = {
  label?: string;
  error?: string;
} & Omit<ComponentProps<typeof Input>, "type">;

export function ConfirmPasswordField({
  label = "Confirmar senha",
  error,
  className,
  autoComplete = "new-password",
  ...inputProps
}: ConfirmPasswordFieldProps) {
  return (
    <FormField label={label} error={error}>
      <Input
        type="password"
        autoComplete={autoComplete}
        className={`touch-target ${className ?? ""}`}
        {...inputProps}
      />
    </FormField>
  );
}
