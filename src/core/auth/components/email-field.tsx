import type { ComponentProps } from "react";
import type { LucideIcon } from "lucide-react";
import { Mail } from "lucide-react";
import { Input } from "@/shared/ui/input";
import { FormField } from "@/shared/components/forms/form-field";

type EmailFieldProps = {
  label?: string;
  error?: string;
  icon?: LucideIcon;
} & Omit<ComponentProps<typeof Input>, "type">;

export function EmailField({
  label = "E-mail",
  error,
  icon: Icon = Mail,
  className,
  ...inputProps
}: EmailFieldProps) {
  return (
    <FormField label={label} error={error}>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="email"
          autoComplete="email"
          className={`pl-11 touch-target ${className ?? ""}`}
          {...inputProps}
        />
      </div>
    </FormField>
  );
}
