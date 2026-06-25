import { Controller, type Control, type FieldPath, type FieldValues } from "react-hook-form";
import { FormField } from "@/components/forms/form-field";
import { selectInputClass } from "@/lib/form-styles";
import { cn } from "@/lib/utils";

const DEFAULT_MIN_YEAR = 1980;

export function buildYearOptions(minYear: number, maxYear: number): number[] {
  const years: number[] = [];
  for (let year = maxYear; year >= minYear; year--) {
    years.push(year);
  }
  return years;
}

interface YearSelectFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  error?: string;
  maxYear: number;
  minYear?: number;
  optional?: boolean;
  className?: string;
}

export function YearSelectField<T extends FieldValues>({
  control,
  name,
  label,
  error,
  maxYear,
  minYear = DEFAULT_MIN_YEAR,
  optional,
  className,
}: YearSelectFieldProps<T>) {
  const years = buildYearOptions(minYear, maxYear);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <FormField label={label} error={error} optional={optional} className={className}>
          <select
            value={field.value != null && field.value !== "" ? String(field.value) : ""}
            onChange={(e) => {
              const value = e.target.value;
              field.onChange(value ? Number(value) : undefined);
            }}
            onBlur={field.onBlur}
            className={cn(selectInputClass)}
          >
            <option value="">Selecione o ano</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </FormField>
      )}
    />
  );
}
