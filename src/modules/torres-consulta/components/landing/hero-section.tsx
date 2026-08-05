import { Car, FileSearch, ShieldCheck, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { ROUTES } from "@/config/routes";
import { Button } from "@/shared/ui/button";
import { HeroConsultaForm } from "./hero-consulta-form";

function HeroIllustration() {
  return (
    <div className="relative mx-auto w-full max-w-lg" aria-hidden>
      <div className="absolute -left-6 top-8 h-48 w-48 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -right-4 bottom-4 h-40 w-40 rounded-full bg-slate-900/5 blur-3xl" />

      <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-gradient-to-br from-white via-slate-50 to-orange-50/40 p-8 shadow-elevated">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-700">
            <ShieldCheck className="h-3.5 w-3.5" />
            Dados verificados
          </div>
          <Sparkles className="h-5 w-5 text-primary/60" />
        </div>

        <div className="mt-8 flex justify-center">
          <div className="relative">
            <div className="flex h-32 w-32 items-center justify-center rounded-[2rem] bg-gradient-to-br from-primary/15 to-orange-400/10 ring-1 ring-primary/10">
              <Car className="h-16 w-16 text-primary" strokeWidth={1.25} />
            </div>
            <div className="absolute -bottom-3 -right-3 rounded-2xl border border-white/80 bg-white px-3 py-2 shadow-soft">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Score
              </p>
              <p className="text-lg font-black text-emerald-600">92</p>
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-2.5">
          {[
            { label: "Leilão", ok: true },
            { label: "Sinistros", ok: false },
            { label: "Recall", ok: true },
            { label: "Restrições", ok: false },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between rounded-xl border border-border/50 bg-white/80 px-4 py-2.5"
            >
              <span className="text-sm font-medium text-foreground">{item.label}</span>
              <span
                className={`text-xs font-bold uppercase tracking-wider ${
                  item.ok ? "text-emerald-600" : "text-slate-400"
                }`}
              >
                {item.ok ? "OK" : "—"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function HeroSection() {
  return (
    <section
      id="inicio"
      className="relative overflow-hidden pt-24 pb-16 sm:pt-28 sm:pb-20 lg:pt-32 lg:pb-28"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgb(234_88_12_/_0.08),transparent_42%),radial-gradient(circle_at_80%_0%,rgb(15_23_42_/_0.04),transparent_38%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgb(15_23_42_/_0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgb(15_23_42_/_0.02)_1px,transparent_1px)] bg-[size:48px_48px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="max-w-xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Consulta veicular premium
            </p>
            <h1 className="mt-6 text-3xl font-black leading-[1.1] tracking-[-0.03em] text-foreground sm:text-4xl lg:text-5xl">
              Consulte o histórico completo de um veículo antes de comprar.
            </h1>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
              Descubra informações importantes utilizando apenas a placa ou o chassi em poucos
              minutos.
            </p>
            <Button variant="outline" size="lg" className="mt-6" asChild>
              <Link to={ROUTES.relatorioExemplo}>
                <FileSearch className="h-4 w-4" />
                Ver Exemplo de Relatório
              </Link>
            </Button>
            <div className="mt-8 lg:hidden">
              <HeroConsultaForm />
            </div>
          </div>

          <div className="hidden flex-col gap-8 lg:flex">
            <HeroConsultaForm />
            <HeroIllustration />
          </div>
          <div className="lg:hidden">
            <HeroIllustration />
          </div>
        </div>
      </div>
    </section>
  );
}
