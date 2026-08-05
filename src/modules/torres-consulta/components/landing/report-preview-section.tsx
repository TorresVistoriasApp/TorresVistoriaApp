import { Link } from "react-router-dom";
import { ArrowRight, FileSearch } from "lucide-react";
import { ROUTES } from "@/config/routes";
import { Button } from "@/shared/ui/button";
import { ScrollReveal } from "./scroll-reveal";

const PREVIEW_PAGES = [
  {
    title: "Resumo do Veículo",
    lines: ["Volkswagen T-Cross", "Placa BRA2E19", "Score: 97 — Excelente"],
    width: "w-[85%]",
  },
  {
    title: "Verificações",
    lines: ["Leilão: OK", "Sinistros: 1 registro", "Recall: Em dia"],
    width: "w-[75%]",
  },
  {
    title: "Linha do Tempo",
    lines: ["2019 — 1º emplacamento", "2021 — Transferência", "2025 — Vistoria aprovada"],
    width: "w-[80%]",
  },
] as const;

export function ReportPreviewSection() {
  return (
    <section className="relative overflow-hidden bg-white py-20 sm:py-28" aria-labelledby="preview-title">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgb(234_88_12_/_0.05),transparent_45%)]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <ScrollReveal>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Transparência total</p>
            <h2
              id="preview-title"
              className="mt-3 text-2xl font-black tracking-tight text-foreground sm:text-4xl"
            >
              Veja exatamente o que você irá receber
            </h2>
            <p className="mt-4 text-muted-foreground">
              Relatório completo, organizado e fácil de entender. Sem surpresas na hora da compra.
            </p>
            <Button size="lg" className="mt-8 rounded-xl" asChild>
              <Link to={ROUTES.relatorioExemplo}>
                <FileSearch className="h-4 w-4" />
                Ver relatório completo
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </ScrollReveal>

          <ScrollReveal delayMs={150}>
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Stacked pages */}
              <div className="relative h-[320px] sm:h-[360px]">
                {PREVIEW_PAGES.map((page, index) => (
                  <div
                    key={page.title}
                    className={`absolute left-1/2 ${page.width} rounded-2xl border border-border/60 bg-white p-5 shadow-elevated transition-transform duration-300 hover:scale-[1.02]`}
                    style={{
                      top: `${index * 28}px`,
                      zIndex: PREVIEW_PAGES.length - index,
                      transform: `translateX(-50%) rotate(${index === 0 ? -2 : index === 1 ? 1 : 3}deg)`,
                    }}
                  >
                    <div className="flex items-center justify-between border-b border-border/40 pb-3">
                      <p className="text-xs font-bold uppercase tracking-wider text-primary">
                        Torres Consulta
                      </p>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                        EXEMPLO
                      </span>
                    </div>
                    <h3 className="mt-3 font-bold text-foreground">{page.title}</h3>
                    <ul className="mt-2 space-y-1">
                      {page.lines.map((line) => (
                        <li key={line} className="text-sm text-muted-foreground">
                          {line}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <div className="pointer-events-none absolute -inset-4 rounded-3xl bg-gradient-to-br from-primary/5 to-transparent" />
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
