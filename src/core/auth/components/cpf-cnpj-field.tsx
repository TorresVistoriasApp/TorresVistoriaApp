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

const DOCUMENT_TYPES: { id: InspectorDocumentType; label: string }[] = [
  { id: "cpf", label: "CPF" },
  { id: "cnpj", label: "CNPJ" },
];

export function CpfCnpjField({
  control,
  documentType,
  onDocumentTypeChange,
  errors,
}: CpfCnpjFieldProps) {
  return (
    <div className="space-y-3">
      <Label>Documento</Label>
      <div className="inline-flex rounded-xl border border-border bg-muted/40 p-1">
        {DOCUMENT_TYPES.map((type) => (
          <button
            key={type.id}
            type="button"
            onClick={() => onDocumentTypeChange(type.id)}
            className={cn(
              "rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
              documentType === type.id
                ? "bg-card text-foreground shadow-soft"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {type.label}
          </button>
        ))}
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
              className="pl-11 font-mono tracking-wide"
              value={field.value ?? ""}
              onChange={(event) => field.onChange(maskCpfCnpj(event.target.value))}
            />
          )}
        />
      </div>
      {errors?.document && (
        <p className="text-sm text-destructive">{errors.document.message}</p>
      )}
    </div>
  );
}
