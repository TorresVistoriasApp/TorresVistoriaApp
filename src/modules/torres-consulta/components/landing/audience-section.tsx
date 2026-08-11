import { ArrowRight, Car, ClipboardCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { ROUTES } from "@/config/routes";
import { ScrollReveal } from "./scroll-reveal";
import { cn } from "@/shared/lib/utils";

const PATHS = [
  {
    id: "comprador",
    icon: Car,
    eyebrow: "Para compradores",
    title: "Consultar antes de comprar",
    description:
      "Descubra leilões, sinistros, recalls e restrições com um relatório completo a partir da placa ou chassi.",
    cta: "Consultar veículo",
    to: ROUTES.consultar,
    accent: "from-orange-500/15 to-orange-400/5",
    border: "hover:border-primary/35",
    iconBg: "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white",
  },
  {
    id: "vistoriador",
    icon: ClipboardCheck,
    eyebrow: "Para vistoriadores",
    title: "Emitir laudo cautelar",
    description:
      "Registre vistorias com fotos, checklist técnico e gere laudos profissionais em PDF — tudo em uma plataforma.",
    cta: "Conhecer Torres Vistoria",
    to: ROUTES.vistoriadores,
    accent: "from-sky-500/15 to-sky-400/5",
    border: "hover:border-sky-500/35",
    iconBg: "bg-sky-500/10 text-sky-600 group-hover:bg-sky-600 group-hover:text-white",
  },
] as const;

export function AudienceSection() {
  return (
    <section
      id="para-quem"
      className="border-y border-border/50 bg-white py-14 sm:py-16"
      aria-labelledby="audience-title"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Dois produtos, um ecossistema</p>
          <h2
            id="audience-title"
            className="mt-3 text-xl font-black tracking-tight text-foreground sm:text-3xl"
          >
            Qual é o seu objetivo hoje?
          </h2>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            Escolha o caminho certo — consulta veicular para compradores ou plataforma profissional
            para vistoriadores.
          </p>
        </ScrollReveal>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:gap-6">
          {PATHS.map((path, index) => (
            <ScrollReveal key={path.id} delayMs={index * 80}>
              <Link
                to={path.to}
                className={cn(
                  "group flex h-full flex-col rounded-2xl border border-border/60 bg-slate-50/50 p-6 transition-all duration-300",
                  "hover:-translate-y-1 hover:bg-white hover:shadow-elevated",
                  path.border,
                )}
              >
                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-2xl transition-all duration-300",
                    path.iconBg,
                  )}
                >
                  <path.icon className="h-6 w-6" strokeWidth={1.75} />
                </div>
                <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
                  {path.eyebrow}
                </p>
                <h3 className="mt-1 text-lg font-bold text-foreground sm:text-xl">{path.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {path.description}
                </p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary group-hover:gap-3">
                  {path.cta}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
