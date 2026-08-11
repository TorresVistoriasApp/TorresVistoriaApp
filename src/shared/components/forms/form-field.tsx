import type { ReactNode } from "react";
import { Label } from "@/shared/ui/label";
import { OptionalLabel } from "@/shared/components/forms/optional-label";
import { cn } from "@/shared/lib/utils";

interface FormFieldProps {
  label: string;
  error?: string;
  hint?: string;
  className?: string;
  labelClassName?: string;
  optional?: boolean;
  labelAction?: ReactNode;
  children: React.ReactNode;
}

export function FormField({
  label,
  error,
  hint,
  className,
  labelClassName,
  optional,
  labelAction,
  children,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-baseline justify-between gap-2">
        <Label
          className={cn(
            "text-sm font-medium leading-snug text-foreground",
            labelClassName,
          )}
        >
          {label}
        </Label>
        {labelAction}
        {optional && !labelAction ? <OptionalLabel /> : null}
      </div>
      <div
        className={cn(
          error &&
            "[&_input]:border-destructive/70 [&_select]:border-destructive/70 [&_textarea]:border-destructive/70",
        )}
      >
        {children}
      </div>
      {hint && !error && (
        <p className="text-xs leading-relaxed text-muted-foreground">{hint}</p>
      )}
      {error && (
        <p className="text-xs font-medium text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
