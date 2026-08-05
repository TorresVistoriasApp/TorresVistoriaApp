import {
  AlertTriangle,
  CheckCircle2,
  ImageIcon,
  Minus,
} from "lucide-react";
import {
  SAMPLE_STATUS_CARDS,
  SAMPLE_TIMELINE,
  SAMPLE_VEHICLE,
  SCORE_COLORS,
  SCORE_LABELS,
} from "@/modules/torres-consulta/data/sample-report";
import { cn } from "@/shared/lib/utils";

function StatusIcon({ status }: { status: "ok" | "warn" | "danger" }) {
  if (status === "ok") return <CheckCircle2 className="h-5 w-5 text-emerald-600" />;
  if (status === "warn") return <AlertTriangle className="h-5 w-5 text-amber-600" />;
  return <Minus className="h-5 w-5 text-red-600" />;
}

export function SampleReportDocument() {
  const vehicle = SAMPLE_VEHICLE;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/70 bg-white shadow-elevated">
      {/* Marca d'água */}
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden"
        aria-hidden
      >
        <span className="-rotate-12 select-none text-[6rem] font-black uppercase tracking-[0.3em] text-slate-900/[0.04] sm:text-[8rem]">
          Exemplo
        </span>
      </div>

      <div className="relative border-b border-border/60 bg-slate-950 px-5 py-6 text-white sm:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Torres Consulta</p>
            <h2 className="mt-1 text-xl font-black sm:text-2xl">Relatório Veicular Completo</h2>
            <p className="mt-1 text-sm text-slate-400">
              Protocolo {vehicle.protocolo} · {vehicle.consultaEm}
            </p>
          </div>
          <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-amber-400">
            Documento de exemplo
          </span>
        </div>
      </div>

      <div className="relative space-y-8 p-5 sm:p-8">
        {/* Resumo */}
        <section>
          <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Resumo do Veículo
          </h3>
          <dl className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Marca", vehicle.marca],
              ["Modelo", vehicle.modelo],
              ["Ano", vehicle.ano],
              ["Placa", vehicle.placa],
              ["Chassi", vehicle.chassi],
              ["Cor", vehicle.cor],
              ["Categoria", vehicle.categoria],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-border/50 bg-slate-50/80 px-4 py-3">
                <dt className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {label}
                </dt>
                <dd className="mt-0.5 font-semibold text-foreground">{value}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Score */}
        <section className="rounded-2xl border border-border/60 bg-gradient-to-br from-slate-50 to-white p-6">
          <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Situação Geral
          </h3>
          <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:gap-8">
            <div className="relative flex h-32 w-32 items-center justify-center">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  fill="none"
                  stroke="#0ea5e9"
                  strokeWidth="8"
                  strokeDasharray={`${vehicle.score * 2.64} 264`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute text-center">
                <p className="text-3xl font-black text-foreground">{vehicle.score}</p>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Score
                </p>
              </div>
            </div>
            <div>
              <p className={cn("text-2xl font-black", SCORE_COLORS[vehicle.scoreLevel])}>
                {SCORE_LABELS[vehicle.scoreLevel]}
              </p>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                Veículo em boa situação geral, com pontos de atenção em sinistro leve e débito de
                IPVA. Recomendamos verificar os detalhes abaixo antes da compra.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {(["excelente", "bom", "atencao", "critico"] as const).map((level) => (
                  <span
                    key={level}
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                      vehicle.scoreLevel === level
                        ? "bg-primary/10 text-primary ring-1 ring-primary/20"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {SCORE_LABELS[level]}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Cards status */}
        <section>
          <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Verificações
          </h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {SAMPLE_STATUS_CARDS.map((card) => (
              <div
                key={card.id}
                className="rounded-xl border border-border/50 bg-white p-4 shadow-soft transition-shadow hover:shadow-elevated"
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-foreground">{card.label}</p>
                  <StatusIcon status={card.status} />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">{card.detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Timeline */}
        <section>
          <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Linha do Tempo
          </h3>
          <ol className="relative mt-4 space-y-0 border-l-2 border-primary/20 pl-6">
            {SAMPLE_TIMELINE.map((item) => (
              <li key={item.date} className="relative pb-6 last:pb-0">
                <span
                  className={cn(
                    "absolute -left-[1.6rem] top-1 h-3 w-3 rounded-full ring-4 ring-white",
                    item.type === "ok" && "bg-emerald-500",
                    item.type === "warn" && "bg-amber-500",
                    item.type === "info" && "bg-sky-500",
                  )}
                />
                <p className="text-xs font-bold text-primary">{item.date}</p>
                <p className="mt-0.5 text-sm text-foreground">{item.event}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Fotos */}
        <section>
          <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Fotos Históricas
          </h3>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="flex aspect-[4/3] flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-slate-50 text-muted-foreground"
              >
                <ImageIcon className="h-8 w-8 opacity-40" />
                <span className="mt-1 text-[10px] font-medium">Foto {n}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Observações */}
        <section className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
          <h3 className="font-semibold text-foreground">Observações</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            <li>Dados consolidados de múltiplas fontes oficiais e parceiros homologados.</li>
            <li>Sinistro registrado em 2019 classificado como de pequena monta.</li>
            <li>Recomenda-se vistoria presencial antes da conclusão da compra.</li>
            <li>Informações sujeitas a atualização conforme disponibilidade das bases.</li>
          </ul>
        </section>
      </div>

      <footer className="border-t border-border/60 bg-slate-50 px-5 py-4 text-center text-xs text-muted-foreground sm:px-8">
        Este documento é apenas um exemplo ilustrativo. Os dados apresentados são fictícios e não
        representam um veículo real.
      </footer>
    </div>
  );
}
