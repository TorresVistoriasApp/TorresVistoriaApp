import { Check, ShieldCheck } from "lucide-react";
import { PUBLIC_IMAGES } from "@/shared/lib/public-images";
import { cn } from "@/shared/lib/utils";

const LAUDO_ROWS = [
  { label: "Checklist técnico", value: "Por etapa" },
  { label: "Fotos guiadas", value: "Data e local" },
  { label: "Parecer", value: "No documento" },
  { label: "Autenticidade", value: "Rastreável" },
] as const;

export function TenantAuthShowcase({ className }: { className?: string }) {
  return (
    <div className={cn("w-full", className)}>
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-elevated">
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.09em] text-primary">
              Torres Vistoria
            </p>
            <p className="mt-1 text-[17px] font-bold text-foreground">Laudo cautelar</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Inspeção em campo · evidências anexadas
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-muted px-2.5 py-1.5 text-[11px] font-semibold text-success">
            <ShieldCheck className="h-3.5 w-3.5" strokeWidth={2.25} aria-hidden />
            Rastreável
          </span>
        </div>

        <div className="border-b border-border bg-muted">
          <img
            src={PUBLIC_IMAGES.auth.inspection}
            alt="Vistoriador inspecionando o assoalho de um veículo elevado"
            width={1200}
            height={800}
            className="h-56 w-full object-cover object-[center_38%] sm:h-64"
            decoding="async"
            fetchPriority="high"
          />
          <p className="px-5 py-3 text-center text-sm font-semibold text-foreground sm:px-6">
            Registro fotográfico da vistoria
            <span className="ml-1.5 font-medium text-muted-foreground">checklist · PDF</span>
          </p>
        </div>

        <ul className="shrink-0 divide-y divide-border">
          {LAUDO_ROWS.map((row) => (
            <li key={row.label} className="flex items-center gap-3 px-5 py-3 sm:px-6">
              <Check className="h-4 w-4 shrink-0 text-success" strokeWidth={2.5} aria-hidden />
              <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">{row.label}</span>
              <span className="shrink-0 text-sm font-semibold text-foreground">{row.value}</span>
            </li>
          ))}
        </ul>

        <div className="shrink-0 border-t border-border px-5 py-4 sm:px-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.09em] text-subtle-foreground">
            Entrega ao cliente
          </p>
          <p className="mt-1 text-sm font-semibold text-foreground">Laudo em PDF, pronto para enviar</p>
        </div>
      </div>
    </div>
  );
}
