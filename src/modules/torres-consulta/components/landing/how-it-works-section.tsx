import { CreditCard, Download, FileText, Search, UserPlus } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const STEPS: { icon: LucideIcon; step: number; title: string; description: string }[] = [
  {
    step: 1,
    icon: Search,
    title: "Digite a placa ou chassi",
    description: "Informe o identificador do veículo que deseja consultar.",
  },
  {
    step: 2,
    icon: UserPlus,
    title: "Crie sua conta gratuitamente",
    description: "Cadastro rápido com e-mail para acessar seus relatórios.",
  },
  {
    step: 3,
    icon: FileText,
    title: "Escolha o relatório",
    description: "Selecione o plano que melhor atende às suas necessidades.",
  },
  {
    step: 4,
    icon: CreditCard,
    title: "Realize o pagamento",
    description: "Pagamento seguro com confirmação imediata.",
  },
  {
    step: 5,
    icon: Download,
    title: "Baixe imediatamente o relatório",
    description: "Acesse e baixe seu relatório completo em PDF.",
  },
];

export function HowItWorksSection() {
  return (
    <section
      id="como-funciona"
      className="bg-canvas py-16 sm:py-20"
      aria-labelledby="como-funciona-title"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Simples e rápido</p>
          <h2
            id="como-funciona-title"
            className="mt-3 text-2xl font-black tracking-tight text-foreground sm:text-3xl"
          >
            Como funciona
          </h2>
        </div>

        <ol className="relative mx-auto mt-14 max-w-2xl">
          <div
            className="absolute left-6 top-0 hidden h-full w-px bg-gradient-to-b from-primary/40 via-primary/20 to-transparent sm:block"
            aria-hidden
          />
          {STEPS.map((step, index) => (
            <li
              key={step.step}
              className="relative flex gap-5 pb-10 last:pb-0 sm:gap-8"
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className="relative z-10 flex shrink-0 flex-col items-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-sm font-black text-white shadow-glow">
                  {step.step}
                </div>
                {index < STEPS.length - 1 && (
                  <div className="mt-2 text-primary/40 sm:hidden" aria-hidden>
                    ↓
                  </div>
                )}
              </div>
              <div className="flex-1 rounded-2xl border border-border/60 bg-white p-5 shadow-soft">
                <div className="flex items-center gap-3">
                  <step.icon className="h-5 w-5 text-primary" strokeWidth={1.75} />
                  <h3 className="font-bold text-foreground">{step.title}</h3>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
