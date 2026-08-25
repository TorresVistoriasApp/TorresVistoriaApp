import { Link } from "react-router-dom";
import { ArrowRight, Check, FileSearch } from "lucide-react";
import { ROUTES } from "@/config/routes";
import { Button } from "@/shared/ui/button";
import { ScrollReveal } from "./scroll-reveal";
import { SectionHeader } from "./section-header";
import { LandingSection } from "./landing-ui";

const REPORT_CHECKS = [
  { label: "Histórico de leilão", status: "Sem registros", ok: true },
  { label: "Sinistros", status: "1 registro", ok: false },
  { label: "Recall", status: "Em dia", ok: true },
  { label: "Roubo e furto", status: "Sem ocorrências", ok: true },
  { label: "Gravame", status: "Sem restrições", ok: true },
] as const;

const TIMELINE = [
  { year: "2019", event: "Primeiro emplacamento" },
  { year: "2021", event: "Transferência de propriedade" },
  { year: "2025", event: "Vistoria aprovada" },
] as const;

export function ReportPreviewSection() {
  return (
    <LandingSection tone="surface" aria-labelledby="preview-title">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
        <ScrollReveal>
          <SectionHeader
            align="left"
            eyebrow="Antes de comprar"
            title="Veja exatamente o que vem no relatório"
            description="Tudo organizado e fácil de ler, do resumo de risco à linha do tempo do veículo. Nada de planilha crua ou sigla que ninguém entende."
            titleId="preview-title"
          />
          <Button size="lg" className="mt-7" asChild>
            <Link to={ROUTES.relatorioExemplo}>
              <FileSearch className="h-4 w-4" aria-hidden />
              Ver relatório de exemplo
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </Button>
        </ScrollReveal>

        <ScrollReveal delayMs={80}>
          <div className="mx-auto w-full max-w-md overflow-hidden rounded-xl border border-border bg-card shadow-elevated lg:max-w-none">
            <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-[0.09em] text-primary">
                  Torres Consulta
                </p>
                <p className="mt-1 truncate text-base font-bold text-foreground">
                  Volkswagen T-Cross
                </p>
                <p className="font-mono text-[13px] tracking-[0.1em] text-muted-foreground">
                  BRA2E19
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-center rounded-lg border border-border bg-muted px-3 py-2">
                <span className="tabular text-xl font-bold leading-none text-foreground">97</span>
                <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.07em] text-subtle-foreground">
                  Score
                </span>
              </div>
            </div>

            <div className="px-5 py-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.09em] text-subtle-foreground">
                Verificações
              </p>
              <ul className="mt-2.5 divide-y divide-border">
                {REPORT_CHECKS.map((check) => (
                  <li key={check.label} className="flex items-center justify-between gap-3 py-2">
                    <span className="min-w-0 truncate text-sm text-muted-foreground">
                      {check.label}
                    </span>
                    <span className="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-foreground">
                      {check.ok ? (
                        <Check className="h-3.5 w-3.5 text-success" strokeWidth={2.5} aria-hidden />
                      ) : (
                        <span className="h-1.5 w-1.5 rounded-full bg-warning" aria-hidden />
                      )}
                      {check.status}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="border-t border-border bg-muted/50 px-5 py-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.09em] text-subtle-foreground">
                Linha do tempo
              </p>
              <ul className="mt-2.5 space-y-2">
                {TIMELINE.map((item) => (
                  <li key={item.year} className="flex items-baseline gap-3 text-sm">
                    <span className="tabular w-10 shrink-0 font-bold text-foreground">
                      {item.year}
                    </span>
                    <span className="text-muted-foreground">{item.event}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </LandingSection>
  );
}
