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
    <LandingSection tone="cinematic" aria-labelledby="preview-title">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <ScrollReveal>
          <SectionHeader
            align="left"
            onDark
            eyebrow="Transparência na compra"
            title="Veja o que você recebe no relatório Torres"
            description="Resumo de risco, checagens críticas e linha do tempo do veículo em linguagem clara. Assim você entende o passado do carro antes de assinar."
            titleId="preview-title"
          />
          <Button size="lg" className="mt-8 shadow-glow" asChild>
            <Link to={ROUTES.relatorioExemplo}>
              <FileSearch className="h-4 w-4" aria-hidden />
              Ver relatório de exemplo
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </Button>
        </ScrollReveal>

        <ScrollReveal delayMs={80}>
          <div className="landing-panel-glass mx-auto w-full max-w-md overflow-hidden rounded-2xl lg:max-w-none">
            <div className="flex items-start justify-between gap-4 border-b border-white/[0.08] px-6 py-5">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">
                  Torres Consulta
                </p>
                <p className="mt-1.5 truncate text-base font-bold tracking-tight text-white">
                  Volkswagen Polo
                </p>
                <p className="mt-0.5 font-mono text-[12px] tracking-[0.14em] text-white/40">
                  BRA2E19
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-center rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5">
                <span className="tabular text-xl font-bold leading-none tracking-tight text-white">
                  97
                </span>
                <span className="mt-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-white/40">
                  Score
                </span>
              </div>
            </div>

            <div className="px-6 py-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35">
                Verificações
              </p>
              <ul className="mt-3 divide-y divide-white/[0.06]">
                {REPORT_CHECKS.map((check) => (
                  <li key={check.label} className="flex items-center justify-between gap-3 py-2.5">
                    <span className="min-w-0 truncate text-sm text-white/50">{check.label}</span>
                    <span className="flex shrink-0 items-center gap-1.5 text-sm font-semibold text-white">
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

            <div className="border-t border-white/[0.08] bg-white/[0.02] px-6 py-5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/35">
                Linha do tempo
              </p>
              <ul className="mt-3 space-y-2.5">
                {TIMELINE.map((item) => (
                  <li key={item.year} className="flex items-baseline gap-3 text-sm">
                    <span className="tabular w-10 shrink-0 font-bold tracking-tight text-white">
                      {item.year}
                    </span>
                    <span className="text-white/50">{item.event}</span>
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
