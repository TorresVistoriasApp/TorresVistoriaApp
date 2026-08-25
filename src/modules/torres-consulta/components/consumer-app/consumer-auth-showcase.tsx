import { Check, FileText, History, Search, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { ROUTES } from "@/config/routes";
import { cn } from "@/shared/lib/utils";

const ACCOUNT_PERKS = [
  { icon: History, title: "Relatórios salvos", detail: "Tudo fica na sua conta para consultar depois" },
  { icon: FileText, title: "PDF na hora", detail: "Baixe o relatório assim que a consulta sair" },
  { icon: Search, title: "Nova consulta", detail: "Informe placa ou chassi quando quiser" },
] as const;

const SAMPLE_REPORTS = [
  { plate: "ABC1D23", status: "Completo" },
  { plate: "RGE2A19", status: "Completo" },
] as const;

export function ConsumerAuthShowcase({ className }: { className?: string }) {
  return (
    <div className={cn("w-full", className)}>
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-elevated">
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4 sm:px-6">
          <div className="min-w-0">
            <p className="ui-eyebrow">Torres Consulta</p>
            <p className="mt-1 text-[17px] font-bold text-foreground">Conta do cliente</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Relatórios salvos · novas consultas
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-muted px-2.5 py-1.5 text-[11px] font-semibold text-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-success" strokeWidth={2.25} aria-hidden />
            Cliente
          </span>
        </div>

        <ul className="divide-y divide-border">
          {ACCOUNT_PERKS.map((perk) => (
            <li key={perk.title} className="flex items-start gap-3 px-5 py-3.5 sm:px-6">
              <span className="landing-icon-box mt-0.5 h-9 w-9">
                <perk.icon className="h-4 w-4" strokeWidth={2} aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-foreground">{perk.title}</span>
                <span className="mt-0.5 block text-[13px] leading-relaxed text-muted-foreground">
                  {perk.detail}
                </span>
              </span>
            </li>
          ))}
        </ul>

        <div className="border-t border-border bg-muted px-5 py-4 sm:px-6">
          <p className="text-[11px] font-bold uppercase tracking-[0.09em] text-subtle-foreground">
            Na sua conta
          </p>
          <ul className="mt-3 space-y-2">
            {SAMPLE_REPORTS.map((report) => (
              <li
                key={report.plate}
                className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card px-3 py-2.5"
              >
                <span className="font-mono text-[13px] font-bold tracking-[0.08em] text-foreground">
                  {report.plate}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-success">
                  <Check className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
                  {report.status}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-t border-border px-5 py-4 sm:px-6">
          <p className="text-sm font-semibold text-foreground">Esta é a Torres Consulta</p>
          <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
            Área de quem consulta veículo para comprar. Se você emite laudo cautelar,{" "}
            <Link
              to={ROUTES.vistoriaLogin}
              className="font-semibold text-primary hover:underline"
            >
              entre na Torres Vistoria
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
