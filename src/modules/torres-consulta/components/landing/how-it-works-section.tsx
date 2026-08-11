import { CreditCard, Download, Search } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ScrollReveal } from "./scroll-reveal";
import { cn } from "@/shared/lib/utils";

const STEPS: {
  step: number;
  icon: LucideIcon;
  title: string;
  description: string;
  details: string[];
  accent: string;
}[] = [
  {
    step: 1,
    icon: Search,
    title: "Informe placa ou chassi",
    description: "Digite os dados do carro e crie sua conta grátis em seguida.",
    details: ["Validamos o formato na hora", "Cadastro rápido, sem burocracia"],
    accent: "from-orange-500/20 to-orange-400/5",
  },
  {
    step: 2,
    icon: CreditCard,
    title: "Escolha o plano e pague",
    description: "Básico, Completo ou Premium. Pague com cartão ou PIX.",
    details: ["Pagamento seguro", "Confirmação na hora"],
    accent: "from-violet-500/20 to-violet-400/5",
  },
  {
    step: 3,
    icon: Download,
    title: "Baixe o relatório",
    description: "O PDF fica disponível na hora e fica salvo na sua conta.",
    details: ["Acesso quando quiser", "Cópia enviada por e-mail"],
    accent: "from-emerald-500/20 to-emerald-400/5",
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
        </ScrollReveal>

        <div className="relative mt-14">
          <div
            className="absolute left-0 right-0 top-[3.5rem] hidden h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent lg:block"
            aria-hidden
          />

          <ol className="grid gap-6 lg:grid-cols-3 lg:gap-8">
            {STEPS.map((step, index) => (
              <ScrollReveal key={step.step} delayMs={index * 100}>
                <li
                  className={cn(
                    "group relative flex h-full flex-col rounded-2xl border border-border/60 bg-slate-50/50 p-6",
                    "transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:bg-white hover:shadow-elevated",
                  )}
                >
                  <div className="flex items-center gap-4">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-sm font-black text-white shadow-glow">
                      {step.step}
                    </span>
                    <div
                      className={cn(
                        "flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-primary",
                        step.accent,
                      )}
                    >
                      <step.icon className="h-5 w-5" strokeWidth={1.75} />
                    </div>
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-foreground">{step.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                  <ul className="mt-4 space-y-1.5 border-t border-border/40 pt-4">
                    {step.details.map((detail) => (
                      <li key={detail} className="text-xs font-medium text-muted-foreground">
                        {detail}
                      </li>
                    ))}
                  </ul>
                </li>
              </ScrollReveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
