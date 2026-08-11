import { Link } from "react-router-dom";
import { ArrowRight, Check, Clock, CreditCard, Download, Search } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ROUTES } from "@/config/routes";
import { Button } from "@/shared/ui/button";
import { ScrollReveal } from "./scroll-reveal";
import { cn } from "@/shared/lib/utils";

const STEPS: {
  step: number;
  icon: LucideIcon;
  title: string;
  description: string;
  details: string[];
  accentBar: string;
  iconBg: string;
  iconColor: string;
  checkColor: string;
}[] = [
  {
    step: 1,
    icon: Search,
    title: "Informe placa ou chassi",
    description: "Digite os dados do carro e crie sua conta grátis em seguida.",
    details: ["Validamos o formato na hora", "Cadastro rápido, sem burocracia"],
    accentBar: "from-orange-500 to-amber-400",
    iconBg: "from-orange-500/20 to-orange-400/5",
    iconColor: "text-orange-600",
    checkColor: "text-orange-500",
  },
  {
    step: 2,
    icon: CreditCard,
    title: "Escolha o plano e pague",
    description: "Básico, Completo ou Premium. Pague com cartão ou PIX.",
    details: ["Pagamento seguro", "Confirmação na hora"],
    accentBar: "from-violet-500 to-purple-400",
    iconBg: "from-violet-500/20 to-violet-400/5",
    iconColor: "text-violet-600",
    checkColor: "text-violet-500",
  },
  {
    step: 3,
    icon: Download,
    title: "Baixe o relatório",
    description: "O PDF fica disponível na hora e fica salvo na sua conta.",
    details: ["Acesso quando quiser", "Cópia enviada por e-mail"],
    accentBar: "from-emerald-500 to-green-400",
    iconBg: "from-emerald-500/20 to-emerald-400/5",
    iconColor: "text-emerald-600",
    checkColor: "text-emerald-500",
  },
];

export function HowItWorksSection() {
  return (
    <section
      id="como-funciona"
      className="relative overflow-hidden bg-white py-20 sm:py-28"
      aria-labelledby="como-funciona-title"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgb(234_88_12_/_0.05),transparent_50%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,rgb(139_92_246_/_0.04),transparent_45%)]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">Passo a passo</p>
          <h2
            id="como-funciona-title"
            className="mt-3 text-2xl font-black tracking-tight text-foreground sm:text-4xl"
          >
            Consulte em 3 passos
          </h2>
          <p className="mt-3 text-muted-foreground">
            Rápido e sem complicação. Em poucos minutos você já tem o histórico na mão.
          </p>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-border/60 bg-slate-50/80 px-4 py-1.5 text-sm font-medium text-muted-foreground">
            <Clock className="h-4 w-4 text-primary" aria-hidden />
            Em menos de 5 minutos
          </div>
        </ScrollReveal>

        {/* Timeline desktop */}
        <div className="relative mt-14 hidden lg:block" aria-hidden>
          <div className="absolute left-[16.67%] right-[16.67%] top-5 h-px bg-gradient-to-r from-orange-300/40 via-violet-300/50 to-emerald-300/40" />
          <div className="grid grid-cols-3 gap-8">
            {STEPS.map((step) => (
              <div key={step.step} className="flex justify-center">
                <span
                  className={cn(
                    "relative z-10 flex h-10 w-10 items-center justify-center rounded-full text-sm font-black text-white shadow-glow ring-4 ring-white",
                    "bg-gradient-to-br",
                    step.accentBar,
                  )}
                >
                  {step.step}
                </span>
              </div>
            ))}
          </div>
        </div>

        <ol className="mt-8 grid gap-6 lg:mt-6 lg:grid-cols-3 lg:gap-8">
          {STEPS.map((step, index) => (
            <ScrollReveal key={step.step} delayMs={index * 100}>
              <li
                className={cn(
                  "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/60 bg-white shadow-soft",
                  "transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-elevated",
                )}
              >
                <div className={cn("h-1 w-full bg-gradient-to-r", step.accentBar)} />

                <div className="flex flex-1 flex-col p-6 sm:p-7">
                  <div className="relative">
                    <div
                      className={cn(
                        "flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br transition-transform duration-300 group-hover:scale-105",
                        step.iconBg,
                        step.iconColor,
                      )}
                    >
                      <step.icon className="h-6 w-6" strokeWidth={1.75} aria-hidden />
                    </div>
                    <span
                      className={cn(
                        "absolute -left-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-black text-white shadow-sm ring-2 ring-white lg:hidden",
                        "bg-gradient-to-br",
                        step.accentBar,
                      )}
                    >
                      {step.step}
                    </span>
                  </div>

                  <h3 className="mt-5 text-lg font-bold text-foreground">{step.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>

                  <ul className="mt-5 space-y-2.5 border-t border-border/40 pt-5">
                    {step.details.map((detail) => (
                      <li key={detail} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                        <Check
                          className={cn("h-4 w-4 shrink-0", step.checkColor)}
                          strokeWidth={2.5}
                          aria-hidden
                        />
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </li>
            </ScrollReveal>
          ))}
        </ol>

        <ScrollReveal delayMs={350} className="mt-12 text-center">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button size="lg" asChild>
              <Link to={ROUTES.consultar}>
                Começar consulta
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to={ROUTES.comoFunciona}>
                Ver detalhes do fluxo
              </Link>
            </Button>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
