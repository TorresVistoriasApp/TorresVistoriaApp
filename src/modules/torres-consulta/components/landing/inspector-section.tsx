import { ArrowRight, Camera, Check, ClipboardCheck, FileText, QrCode, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { ROUTES } from "@/config/routes";
import { Button } from "@/shared/ui/button";
import { ScrollReveal } from "./scroll-reveal";
import { LandingBadge, LandingSection } from "./landing-ui";

const FEATURES: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: ClipboardCheck,
    title: "Checklist de vistoria",
    description: "Itens organizados por etapa para não esquecer nada na inspeção.",
  },
  {
    icon: Camera,
    title: "Fotos no celular",
    description: "O app orienta os ângulos e registra data e local da vistoria.",
  },
  {
    icon: FileText,
    title: "Laudo em PDF",
    description: "Documento pronto para o cliente, com parecer e fotos anexadas.",
  },
  {
    icon: QrCode,
    title: "Validação do laudo",
    description: "Quem recebe o documento confere a autenticidade pelo site.",
  },
];

const HIGHLIGHTS = [
  "Laudo cautelar com parecer técnico e fotos",
  "Controle de vistorias, clientes e equipe",
  "Visão financeira e relatórios da operação",
] as const;

export function InspectorSection() {
  return (
    <LandingSection id="vistoriadores" tone="ink" aria-labelledby="vistoriadores-title">
      <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-14">
        <ScrollReveal>
          <LandingBadge tone="ink">Torres Vistoria</LandingBadge>
          <h2
            id="vistoriadores-title"
            className="mt-4 text-balance text-[1.75rem] font-bold leading-[1.12] sm:text-[2rem] lg:text-[2.375rem]"
          >
            A plataforma de quem emite laudo cautelar
          </h2>
          <p className="mt-4 text-pretty text-[15px] leading-relaxed text-ink-muted sm:text-base">
            Se você é vistoriador ou tem uma empresa de vistoria, a Torres Vistoria reúne o que você
            precisa em campo: registro da inspeção, fotos, checklist e laudo em PDF para o cliente.
          </p>

          <ul className="mt-6 space-y-3">
            {HIGHLIGHTS.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-ink-foreground">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" strokeWidth={2.5} aria-hidden />
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-7 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
            <Button size="lg" asChild>
              <Link to={ROUTES.vistoriaLogin}>
                Acessar plataforma
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-ink-border bg-ink-soft text-ink-foreground hover:bg-ink-border"
              asChild
            >
              <Link to={ROUTES.vistoriaRegister}>
                <Users className="h-4 w-4" aria-hidden />
                Criar conta
              </Link>
            </Button>
          </div>

          <p className="mt-5 text-xs leading-relaxed text-ink-muted">
            A Torres Consulta é para quem vai comprar um carro. Esta é a área de quem faz e emite
            vistorias.
          </p>
        </ScrollReveal>

        <ScrollReveal delayMs={80}>
          <div className="grid gap-px overflow-hidden rounded-xl border border-ink-border bg-ink-border sm:grid-cols-2">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="bg-ink-soft p-5">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-ink-border bg-ink text-primary">
                  <feature.icon className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
                </span>
                <p className="mt-3.5 text-sm font-bold text-ink-foreground">{feature.title}</p>
                <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </LandingSection>
  );
}
