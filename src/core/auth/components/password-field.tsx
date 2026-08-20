import type { ComponentProps, ReactNode } from "react";
import { useState } from "react";
import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { Input } from "@/shared/ui/input";
import { FormField } from "@/shared/components/forms/form-field";

type PasswordFieldProps = {
  label?: string;
  error?: string;
  labelAction?: ReactNode;
} & Omit<ComponentProps<typeof Input>, "type">;

export function PasswordField({
  label = "Senha",
  error,
  labelAction,
  className,
  autoComplete = "current-password",
  id,
  ...inputProps
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <FormField label={label} error={error} labelAction={labelAction} htmlFor={id}>
      <div className="relative">
        <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id={id}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          className={`touch-target pl-11 pr-11 ${className ?? ""}`}
          {...inputProps}
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
          aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </FormField>
  );
}
