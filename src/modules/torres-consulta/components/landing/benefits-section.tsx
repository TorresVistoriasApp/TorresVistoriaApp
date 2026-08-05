import {
  AlertTriangle,
  Camera,
  Car,
  FileSearch,
  Gavel,
  Scale,
  Shield,
  Star,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ScrollReveal } from "./scroll-reveal";

const BENEFITS: { icon: LucideIcon; title: string; description: string }[] = [
  { icon: Gavel, title: "Histórico de Leilão", description: "Verifique se o veículo passou por leilão e em quais condições." },
  { icon: AlertTriangle, title: "Histórico de Sinistros", description: "Identifique registros de acidentes e indenizações anteriores." },
  { icon: Shield, title: "Roubo e Furto", description: "Consulte bases oficiais de ocorrência de roubo e furto." },
  { icon: Car, title: "Recall", description: "Saiba se há campanhas de recall pendentes para o modelo." },
  { icon: Scale, title: "Restrições Financeiras", description: "Detecte gravames, alienação fiduciária e outras restrições." },
  { icon: Star, title: "Score Veicular", description: "Avaliação consolidada da situação geral do veículo." },
  { icon: FileSearch, title: "Decodificação VIN", description: "Dados técnicos completos a partir do chassi do veículo." },
  { icon: Camera, title: "Fotos Históricas", description: "Imagens registradas em vistorias e leilões anteriores." },
  { icon: Users, title: "Histórico de Proprietários", description: "Quando permitido por lei, visualize transferências anteriores." },
];

export function BenefitsSection() {
  return (
    <section className="bg-white py-20 sm:py-28" aria-labelledby="beneficios-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Inteligência veicular</p>
          <h2
            id="beneficios-title"
            className="mt-3 text-2xl font-black tracking-tight text-foreground sm:text-4xl"
          >
            Tudo que você precisa saber antes de comprar
          </h2>
          <p className="mt-4 text-muted-foreground">
            Dados consolidados de múltiplas fontes oficiais em um único relatório.
          </p>
        </ScrollReveal>

        <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map((benefit, index) => (
            <ScrollReveal key={benefit.title} delayMs={index * 50}>
              <li className="group h-full rounded-2xl border border-border/50 bg-slate-50/40 p-7 shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/25 hover:bg-white hover:shadow-elevated">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-orange-400/5 text-primary ring-1 ring-primary/10 transition-all duration-300 group-hover:scale-105 group-hover:bg-primary group-hover:text-white group-hover:ring-primary/30">
                  <benefit.icon className="h-7 w-7" strokeWidth={1.5} />
                </div>
                <h3 className="mt-5 text-lg font-bold text-foreground">{benefit.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {benefit.description}
                </p>
              </li>
            </ScrollReveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
