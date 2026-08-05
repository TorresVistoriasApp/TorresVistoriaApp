import { CreditCard, Download, FileText, Search, UserPlus } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ScrollReveal } from "./scroll-reveal";
import { cn } from "@/shared/lib/utils";

const STEPS: {
  step: number;
  icon: LucideIcon;
  title: string;
  description: string;
  accent: string;
}[] = [
  {
    step: 1,
    icon: Search,
    title: "Digite placa ou chassi",
    description: "Informe o identificador do veículo na plataforma.",
    accent: "from-orange-500/20 to-orange-400/5",
  },
  {
    step: 2,
    icon: UserPlus,
    title: "Crie sua conta",
    description: "Cadastro gratuito em menos de 1 minuto.",
    accent: "from-sky-500/20 to-sky-400/5",
  },
  {
    step: 3,
    icon: FileText,
    title: "Escolha o relatório",
    description: "Básico, Completo ou Premium — você decide.",
    accent: "from-violet-500/20 to-violet-400/5",
  },
  {
    step: 4,
    icon: CreditCard,
    title: "Pague com segurança",
    description: "Cartão ou PIX com confirmação imediata.",
    accent: "from-emerald-500/20 to-emerald-400/5",
  },
  {
    step: 5,
    icon: Download,
    title: "Baixe na hora",
    description: "Relatório completo disponível instantaneamente.",
    accent: "from-amber-500/20 to-amber-400/5",
  },
];

export function HowItWorksSection() {
  return (
    <section
      id="como-funciona"
      className="relative overflow-hidden bg-slate-950 py-20 sm:py-28"
      aria-labelledby="como-funciona-title"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgb(234_88_12_/_0.08),transparent_50%)]" />
      <div className="landing-grid-bg pointer-events-none absolute inset-0 opacity-[0.07]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary">Fluxo inteligente</p>
          <h2
            id="como-funciona-title"
            className="mt-3 text-2xl font-black tracking-tight text-white sm:text-4xl"
          >
            Do cadastro ao relatório em minutos
          </h2>
          <p className="mt-3 text-slate-400">
            Cinco passos simples. Uma plataforma que trabalha por você.
          </p>
        </ScrollReveal>

        <div className="relative mt-14">
          {/* Connector line — desktop */}
          <div
            className="absolute left-0 right-0 top-[4.5rem] hidden h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent lg:block"
            aria-hidden
          />

          <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5 lg:gap-4">
            {STEPS.map((step, index) => (
              <ScrollReveal key={step.step} delayMs={index * 80}>
                <li
                  className={cn(
                    "group relative flex h-full flex-col rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm",
                    "transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:bg-white/10 hover:shadow-[0_20px_50px_rgb(0_0_0_/_0.3)]",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-sm font-black text-white shadow-glow">
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
                  <h3 className="mt-5 font-bold text-white">{step.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-400">
                    {step.description}
                  </p>
                  {/* Mini illustration bar */}
                  <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-orange-400 transition-all duration-500 group-hover:w-full"
                      style={{ width: `${(step.step / 5) * 100}%` }}
                    />
                  </div>
                </li>
              </ScrollReveal>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
