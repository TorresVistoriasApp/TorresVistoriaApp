import { IdCard } from "lucide-react";
import { Controller, type Control, type FieldErrors } from "react-hook-form";
import type { InspectorRegisterInput } from "@/core/auth/schemas/inspector-auth";
import { Label } from "@/shared/ui/label";
import { Input } from "@/shared/ui/input";
import { cn } from "@/shared/lib/utils";
import { maskCpfCnpj } from "@/shared/lib/masks";
import type { InspectorDocumentType } from "@/core/auth/validators/document";

interface CpfCnpjFieldProps {
  control: Control<InspectorRegisterInput>;
  documentType: InspectorDocumentType;
  onDocumentTypeChange: (type: InspectorDocumentType) => void;
  errors?: FieldErrors<InspectorRegisterInput>;
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
}: CpfCnpjFieldProps) {
  const error = errors?.document?.message;

  return (
    <div className="space-y-2">
      <Label htmlFor="inspector-document">Documento</Label>

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

      <div className="relative">
        <IdCard className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Controller
          control={control}
          name="document"
          render={({ field }) => (
            <Input
              id="inspector-document"
              placeholder={documentType === "cpf" ? "000.000.000-00" : "00.000.000/0000-00"}
              autoComplete="off"
              inputMode="numeric"
              enterKeyHint="next"
              aria-invalid={Boolean(error)}
              className={cn("touch-target pl-11 font-mono tracking-wide", error && "border-destructive/70")}
              value={field.value ?? ""}
              onChange={(event) => field.onChange(maskCpfCnpj(event.target.value))}
              onBlur={field.onBlur}
            />
          )}
        />
      </div>
      {error && <p className="text-xs font-medium text-destructive">{error}</p>}
    </div>
  );
}
