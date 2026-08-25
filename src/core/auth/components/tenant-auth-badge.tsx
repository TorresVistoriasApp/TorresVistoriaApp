import { ShieldCheck } from "lucide-react";
import { cn } from "@/shared/lib/utils";

/** Selo que identifica a área profissional, diferenciando do fluxo do consumidor. */
export function TenantAuthBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "ui-badge gap-2 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em]",
        className,
      )}
    >
      <ShieldCheck className="h-3.5 w-3.5" strokeWidth={2.5} />
      Área do vistoriador
    </span>
  );
}
