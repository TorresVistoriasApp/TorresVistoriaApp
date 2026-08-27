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

      <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-border bg-border lg:mt-12 sm:grid-cols-2">
        {PATHS.map((path, index) => (
          <ScrollReveal key={path.id} delayMs={index * 60} className="bg-card">
            <Link
              to={path.to}
              className="group flex h-full flex-col p-6 transition-colors hover:bg-muted/40 sm:p-7"
            >
              <span
                className={
                  path.accent
                    ? "flex h-10 w-10 items-center justify-center rounded-xl border border-primary/20 bg-brand-subtle text-primary"
                    : "flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-muted text-foreground"
                }
              >
                <path.icon className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
              </span>
              <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.1em] text-subtle-foreground">
                {path.eyebrow}
              </p>
              <h3 className="mt-1.5 text-lg font-bold tracking-tight text-foreground">{path.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                {path.description}
              </p>
              <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
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
