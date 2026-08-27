import { ArrowRight, Car, ClipboardCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { ROUTES } from "@/config/routes";
import { ScrollReveal } from "./scroll-reveal";
import { SectionHeader } from "./section-header";
import { LandingSection } from "./landing-ui";

const PATHS = [
  {
    id: "comprador",
    icon: Car,
    eyebrow: "Vou comprar um carro",
    title: "Consultar o histórico",
    description:
      "Leilão, sinistro, recall e restrições em um relatório claro. Informe a placa ou o chassi e receba o resultado na hora.",
    cta: "Consultar veículo",
    to: ROUTES.consultar,
    accent: true,
  },
  {
    id: "vistoriador",
    icon: ClipboardCheck,
    eyebrow: "Trabalho com vistoria",
    title: "Emitir laudo cautelar",
    description:
      "Fotos, checklist e laudo em PDF no mesmo sistema. A plataforma que a equipe Torres usa no dia a dia das vistorias.",
    cta: "Conhecer Torres Vistoria",
    to: ROUTES.vistoriaLogin,
    accent: false,
  },
] as const;

export function AudienceSection() {
  return (
    <LandingSection id="para-quem" aria-labelledby="audience-title">
      <ScrollReveal>
        <SectionHeader
          eyebrow="Para quem é"
          title="O que você precisa fazer hoje?"
          description="Compradores consultam o histórico do veículo. Vistoriadores emitem laudos na plataforma profissional do ecossistema Torres."
          titleId="audience-title"
        />
      </ScrollReveal>

      <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-[rgb(16_21_28_/_0.08)] bg-[rgb(16_21_28_/_0.08)] lg:mt-14 sm:grid-cols-2">
        {PATHS.map((path, index) => (
          <ScrollReveal key={path.id} delayMs={index * 60} className="bg-card">
            <Link
              to={path.to}
              className="group flex h-full flex-col p-7 transition-colors hover:bg-muted/30 sm:p-8"
            >
              <span
                className={
                  path.accent
                    ? "flex h-11 w-11 items-center justify-center rounded-xl border border-primary/15 bg-brand-subtle text-primary"
                    : "flex h-11 w-11 items-center justify-center rounded-xl border border-[rgb(16_21_28_/_0.08)] bg-muted/50 text-foreground"
                }
              >
                <path.icon className="h-5 w-5" strokeWidth={1.5} aria-hidden />
              </span>
              <p className="mt-6 text-[10px] font-semibold uppercase tracking-[0.14em] text-subtle-foreground">
                {path.eyebrow}
              </p>
              <h3 className="mt-2 text-xl font-bold tracking-[-0.02em] text-foreground">
                {path.title}
              </h3>
              <p className="mt-2.5 flex-1 text-[15px] leading-[1.65] text-muted-foreground">
                {path.description}
              </p>
              <span className="mt-7 inline-flex items-center gap-2 text-sm font-semibold tracking-wide text-primary">
                {path.cta}
                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                />
              </span>
            </Link>
          </ScrollReveal>
        ))}
      </div>
    </LandingSection>
  );
}
