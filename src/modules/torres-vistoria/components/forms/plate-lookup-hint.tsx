import { CheckCircle2, Loader2 } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export type PlateLookupState = "idle" | "loading" | "success" | "partial";

interface PlateLookupHintProps {
  state: PlateLookupState;
  className?: string;
}

/**
 * Indicador visual para consulta automática por placa.
 * A integração com API será conectada futuramente — por ora apenas a UI.
 */
export function PlateLookupHint({ state, className }: PlateLookupHintProps) {
  if (state === "idle") return null;

  if (state === "loading") {
    return (
      <div
        className={cn(
          "flex items-center gap-2 rounded-lg border border-border bg-muted px-3 py-2",
          className,
        )}
        role="status"
        aria-live="polite"
      >
        <Loader2 className="size-3.5 shrink-0 animate-spin text-primary" aria-hidden />
        <p className="text-xs text-muted-foreground">Consultando dados da placa...</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-lg border border-success-border bg-success-subtle px-3 py-2",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <CheckCircle2 className="mt-0.5 size-3.5 shrink-0 text-success" aria-hidden />
      <p className="text-xs leading-relaxed text-success">
        {state === "success"
          ? "Dados preenchidos automaticamente pela consulta da placa."
          : "Alguns dados foram preenchidos. Complete manualmente os campos restantes."}
      </p>
    </div>
  );
}
