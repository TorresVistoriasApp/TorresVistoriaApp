import { Controller, type Control, type FieldPath, type FieldValues } from "react-hook-form";
import { FIELD_NA_VALUE, isFieldNA } from "@/lib/field-na";
import { MaskedInput } from "@/components/ui/masked-input";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/forms/form-field";
import { cn } from "@/lib/utils";
import type { MaskType } from "@/lib/masks";

interface OptionalMaskedFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  error?: string;
  mask?: MaskType;
  placeholder?: string;
  className?: string;
  naLabel?: string;
  inputClassName?: string;
}

export function OptionalMaskedField<T extends FieldValues>({
  control,
  name,
  label,
  error,
  mask,
  placeholder,
  className,
  naLabel = "Não possui",
  inputClassName,
}: OptionalMaskedFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => {
        const isNA = isFieldNA(field.value);
        const toggleNA = () => {
          field.onChange(isNA ? "" : FIELD_NA_VALUE);
        };

        return (
          <FormField label={label} error={error} className={className} optional>
            <div className="space-y-2.5">
              {mask ? (
                <MaskedInput
                  mask={mask}
                  value={isNA ? "" : (field.value ?? "")}
                  onChange={field.onChange}
                  placeholder={placeholder}
                  disabled={isNA}
                  className={cn(inputClassName, isNA && "opacity-50")}
                />
              ) : (
                <Input
                  value={isNA ? "" : (field.value ?? "")}
                  onChange={field.onChange}
                  placeholder={placeholder}
                  disabled={isNA}
                  className={cn(inputClassName, isNA && "opacity-50")}
                />
              )}
              <label className="flex min-h-[44px] cursor-pointer items-center gap-3 rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted/40">
                <input
                  type="checkbox"
                  checked={isNA}
                  onChange={toggleNA}
                  className="size-4 shrink-0 rounded border-border accent-primary"
                />
                <span>{naLabel}</span>
              </label>
            </div>
          </FormField>
        );
      }}
    />
  );
}

interface MaskedFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  error?: string;
  mask: MaskType;
  placeholder?: string;
  className?: string;
  hint?: string;
  inputClassName?: string;
  disabled?: boolean;
  labelClassName?: string;
}

export function MaskedField<T extends FieldValues>({
  control,
  name,
  label,
  error,
  mask,
  placeholder,
  className,
  hint,
  inputClassName,
  disabled,
  labelClassName,
}: MaskedFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <FormField
          label={label}
          error={error}
          hint={hint}
          className={className}
          labelClassName={labelClassName}
        >
          <MaskedInput
            mask={mask}
            value={field.value ?? ""}
            onChange={field.onChange}
            onBlur={field.onBlur}
            placeholder={placeholder}
            className={inputClassName}
            disabled={disabled}
          />
        </FormField>
      )}
    />
  );
}
