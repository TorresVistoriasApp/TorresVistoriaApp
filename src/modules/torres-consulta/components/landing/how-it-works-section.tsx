import { Link } from "react-router-dom";
import { ArrowRight, Check, CreditCard, Download, Search } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ROUTES } from "@/config/routes";
import { Button } from "@/shared/ui/button";
import { ScrollReveal } from "./scroll-reveal";
import { SectionHeader } from "./section-header";
import { LandingSection } from "./landing-ui";

const STEPS: {
  step: string;
  icon: LucideIcon;
  title: string;
  description: string;
  details: string[];
}[] = [
  {
    step: "01",
    icon: Search,
    title: "Informe a placa ou o chassi",
    description: "Digite os dados do carro e crie sua conta grátis em poucos segundos.",
    details: ["Validamos o formato na hora", "Cadastro rápido, sem burocracia"],
  },
  {
    step: "02",
    icon: CreditCard,
    title: "Escolha o plano e pague",
    description: "Básico, Completo ou Premium. Pague com cartão ou PIX com segurança.",
    details: ["Pagamento protegido", "Confirmação na hora"],
  },
  {
    step: "03",
    icon: Download,
    title: "Baixe o relatório e decida",
    description: "O PDF fica pronto na hora e salvo na sua conta para consultar depois.",
    details: ["Acesso quando quiser", "Cópia enviada por email"],
  },
];

export function HowItWorksSection() {
  return (
    <LandingSection id="como-funciona" aria-labelledby="como-funciona-title">
      <ScrollReveal>
        <SectionHeader
          eyebrow="Simples e rápido"
          title="Do zero ao relatório em 3 passos"
          description="Em poucos minutos você sabe se vale a pena fechar negócio. Sem ligação, sem cadastro longo e sem espera."
          titleId="como-funciona-title"
        />
      </ScrollReveal>

      <ol className="mt-12 grid gap-5 lg:mt-14 lg:grid-cols-3 lg:gap-6">
        {STEPS.map((step, index) => (
          <ScrollReveal key={step.step} delayMs={index * 60}>
            <li className="relative flex h-full flex-col rounded-2xl border border-[rgb(16_21_28_/_0.08)] bg-card p-7 sm:p-8">
              <div className="flex items-center justify-between gap-3">
                <span className="tabular text-[13px] font-semibold tracking-[0.12em] text-primary">
                  {step.step}
                </span>
                <step.icon
                  className="h-[18px] w-[18px] shrink-0 text-subtle-foreground"
                  strokeWidth={1.5}
                  aria-hidden
                />
              </div>

              <h3 className="mt-6 text-lg font-bold tracking-[-0.02em] text-foreground">
                {step.title}
              </h3>
              <p className="mt-2 text-[15px] leading-[1.65] text-muted-foreground">
                {step.description}
              </p>

              <ul className="mt-5 space-y-2.5">
                {step.details.map((detail) => (
                  <li
                    key={detail}
                    className="flex items-center gap-2.5 text-sm font-medium text-muted-foreground"
                  >
                    <Check className="h-3.5 w-3.5 shrink-0 text-success" strokeWidth={2.5} aria-hidden />
                    {detail}
                  </li>
                ))}
              </ul>
            </li>
          </ScrollReveal>
        ))}
      </ol>

      <ScrollReveal delayMs={90} className="mt-12">
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button size="lg" className="shadow-glow" asChild>
            <Link to={ROUTES.consultar}>
              Começar minha consulta
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link to={ROUTES.comoFunciona}>Ver como funciona</Link>
          </Button>
        </div>
      </ScrollReveal>
    </LandingSection>
  );
}
