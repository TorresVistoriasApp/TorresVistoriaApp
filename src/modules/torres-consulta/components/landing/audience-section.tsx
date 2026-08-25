import { ArrowRight, Car, ClipboardCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { ROUTES } from "@/config/routes";
import { ScrollReveal } from "./scroll-reveal";
import { SectionHeader } from "./section-header";
import { LandingCard, LandingIconBox, LandingSection } from "./landing-ui";

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

      <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:mt-11">
        {PATHS.map((path, index) => (
          <ScrollReveal key={path.id} delayMs={index * 60} className="h-full">
            <Link to={path.to} className="group block h-full rounded-xl">
              <LandingCard interactive className="flex h-full flex-col p-5 sm:p-6">
                <LandingIconBox
                  tone={path.accent ? "brand" : "neutral"}
                  className="h-10 w-10"
                >
                  <path.icon className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
                </LandingIconBox>
                <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.08em] text-subtle-foreground">
                  {path.eyebrow}
                </p>
                <h3 className="mt-1.5 text-lg font-bold text-foreground">{path.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {path.description}
                </p>
                <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                  {path.cta}
                  <ArrowRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </span>
              </LandingCard>
            </Link>
          </ScrollReveal>
        ))}
      </div>
    </LandingSection>
  );
}
