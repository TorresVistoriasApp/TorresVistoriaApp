import { Info } from "lucide-react";
import { cn } from "@/shared/lib/utils";

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
          "inline-flex items-center gap-1 rounded-md border border-border bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground",
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
        "flex items-start gap-2 rounded-lg border border-border bg-muted px-3 py-2.5 text-xs leading-relaxed text-muted-foreground",
        className,
      )}
    >
      <Info className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden />
      <span>{OPTIONAL_SECTION_HINT}</span>
    </p>
  );
}
