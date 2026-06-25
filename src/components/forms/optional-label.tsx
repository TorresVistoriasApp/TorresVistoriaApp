import { Info } from "lucide-react";
import { cn } from "@/lib/utils";

export const OPTIONAL_SECTION_HINT =
  "Preencha somente se aplicável. Campos em branco não entram no laudo PDF.";

export const OPTIONAL_SECTION_COLLAPSED_HINT =
  "Toque para abrir. Se não preencher, esta seção não entra no laudo.";

interface OptionalLabelProps {
  variant?: "field" | "section";
  className?: string;
}

export function OptionalLabel({ variant = "field", className }: OptionalLabelProps) {
  if (variant === "section") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 rounded-md bg-sky-50 px-2 py-0.5 text-[11px] font-medium text-sky-800 ring-1 ring-inset ring-sky-200/80",
          className,
        )}
      >
        Não obrigatório
      </span>
    );
  }

  return (
    <span className={cn("text-xs font-normal text-muted-foreground", className)}>(opcional)</span>
  );
}

export function OptionalSectionHint({ className }: { className?: string }) {
  return (
    <p
      className={cn(
        "flex items-start gap-2 rounded-lg border border-sky-100 bg-sky-50/70 px-3 py-2.5 text-xs leading-relaxed text-sky-900",
        className,
      )}
    >
      <Info className="mt-0.5 size-3.5 shrink-0 text-sky-600" aria-hidden />
      <span>{OPTIONAL_SECTION_HINT}</span>
    </p>
  );
}
