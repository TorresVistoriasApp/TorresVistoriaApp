import { IdCard } from "lucide-react";
import { Controller, type Control, type FieldErrors } from "react-hook-form";
import type { InspectorRegisterInput } from "@/core/auth/schemas/inspector-auth";
import { Label } from "@/shared/ui/label";
import { Input } from "@/shared/ui/input";
import { FormField } from "@/shared/components/forms/form-field";
import { cn } from "@/shared/lib/utils";
import { maskCpfCnpj } from "@/shared/lib/masks";
import type { InspectorDocumentType } from "@/core/auth/validators/document";

interface CpfCnpjFieldProps {
  control: Control<InspectorRegisterInput>;
  documentType: InspectorDocumentType;
  onDocumentTypeChange: (type: InspectorDocumentType) => void;
  errors?: FieldErrors<InspectorRegisterInput>;
  compact?: boolean;
}

const DOCUMENT_TYPES: { id: InspectorDocumentType; label: string; hint: string }[] = [
  { id: "cpf", label: "CPF", hint: "Pessoa física" },
  { id: "cnpj", label: "CNPJ", hint: "Empresa" },
];

export function CpfCnpjField({
  control,
  documentType,
  onDocumentTypeChange,
  errors,
  compact = false,
}: CpfCnpjFieldProps) {
  const error = errors?.document?.message;
  const placeholder = documentType === "cpf" ? "000.000.000-00" : "00.000.000/0000-00";

  const documentInput = (
    <Controller
      control={control}
      name="document"
      render={({ field }) => (
        <Input
          id="inspector-document"
          placeholder={placeholder}
          autoComplete="off"
          inputMode="numeric"
          enterKeyHint="next"
          aria-invalid={Boolean(error)}
          className={cn(
            compact
              ? "h-full rounded-none border-0 bg-transparent pl-10 font-mono tracking-wide shadow-none focus-visible:border-transparent"
              : "touch-target pl-11 font-mono tracking-wide",
            !compact && error && "border-destructive/70",
          )}
          value={field.value ?? ""}
          onChange={(event) => field.onChange(maskCpfCnpj(event.target.value))}
          onBlur={field.onBlur}
        />
      )}
    />
  );

  const typeToggle = (
    <div
      role="group"
      aria-label="Tipo de documento"
      className="grid grid-cols-2 gap-1 rounded-lg border border-border bg-muted p-1"
    >
      {DOCUMENT_TYPES.map((type) => {
        const selected = documentType === type.id;
        return (
          <button
            key={type.id}
            type="button"
            aria-pressed={selected}
            onClick={() => onDocumentTypeChange(type.id)}
            className={cn(
              "flex flex-col items-center rounded-lg px-3 py-1.5 transition-colors",
              selected
                ? "bg-card text-foreground shadow-soft"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <span className="text-sm font-semibold">{type.label}</span>
            <span className="text-[10px] font-medium opacity-70">{type.hint}</span>
          </button>
        );
      })}
    </div>
  );

  if (compact) {
    return (
      <FormField label="Documento" error={error} htmlFor="inspector-document">
        <div
          className={cn(
            "flex h-11 items-stretch overflow-hidden rounded-xl border border-border bg-card shadow-soft focus-within:border-primary",
            error && "border-destructive/70",
          )}
        >
          <div
            role="group"
            aria-label="Tipo de documento"
            className="flex shrink-0 gap-0.5 border-r border-border bg-muted p-1"
          >
            {DOCUMENT_TYPES.map((type) => {
              const selected = documentType === type.id;
              return (
                <button
                  key={type.id}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onDocumentTypeChange(type.id)}
                  className={cn(
                    "rounded-lg px-2.5 text-xs font-semibold transition-colors",
                    selected
                      ? "bg-card text-foreground shadow-soft"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {type.label}
                </button>
              );
            })}
          </div>
          <div className="relative min-w-0 flex-1">
            <IdCard className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            {documentInput}
          </div>
        </div>
      </FormField>
    );
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="inspector-document">Documento</Label>
      {typeToggle}
      <div className="relative">
        <IdCard className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        {documentInput}
      </div>
      {error ? <p className="text-xs font-medium text-destructive">{error}</p> : null}
    </div>
  );
}
