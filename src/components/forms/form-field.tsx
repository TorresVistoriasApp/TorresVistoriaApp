import { Label } from "@/components/ui/label";
import { OptionalLabel } from "@/components/forms/optional-label";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  label: string;
  error?: string;
  hint?: string;
  className?: string;
  labelClassName?: string;
  optional?: boolean;
  children: React.ReactNode;
}

export function FormField({
  label,
  error,
  hint,
  className,
  labelClassName,
  optional,
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
        {optional && <OptionalLabel />}
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
