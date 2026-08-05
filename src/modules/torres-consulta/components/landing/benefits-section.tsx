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

const BENEFITS: { icon: LucideIcon; title: string; description: string }[] = [
  {
    icon: Gavel,
    title: "Histórico de Leilão",
    description: "Verifique se o veículo passou por leilão e em quais condições.",
  },
  {
    icon: AlertTriangle,
    title: "Histórico de Sinistros",
    description: "Identifique registros de acidentes e indenizações anteriores.",
  },
  {
    icon: Shield,
    title: "Roubo e Furto",
    description: "Consulte bases oficiais de ocorrência de roubo e furto.",
  },
  {
    icon: Car,
    title: "Recall",
    description: "Saiba se há campanhas de recall pendentes para o modelo.",
  },
  {
    icon: Scale,
    title: "Restrições Financeiras",
    description: "Detecte gravames, alienação fiduciária e outras restrições.",
  },
  {
    icon: Star,
    title: "Score Veicular",
    description: "Avaliação consolidada da situação geral do veículo.",
  },
  {
    icon: FileSearch,
    title: "Decodificação VIN",
    description: "Dados técnicos completos a partir do chassi do veículo.",
  },
  {
    icon: Camera,
    title: "Fotos Históricas",
    description: "Imagens registradas em vistorias e leilões anteriores.",
  },
  {
    icon: Users,
    title: "Histórico de Proprietários",
    description: "Quando permitido por lei, visualize transferências anteriores.",
  },
];

export function BenefitsSection() {
  return (
    <section className="bg-white py-16 sm:py-20" aria-labelledby="beneficios-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
            O que você descobre
          </p>
          <h2
            id="beneficios-title"
            className="mt-3 text-2xl font-black tracking-tight text-foreground sm:text-3xl"
          >
            Informações que fazem diferença na hora de comprar
          </h2>
          <p className="mt-3 text-muted-foreground">
            Relatórios completos com dados de múltiplas fontes, reunidos em um único documento.
          </p>
        </div>

        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map((benefit) => (
            <li
              key={benefit.title}
              className="group rounded-2xl border border-border/60 bg-slate-50/50 p-5 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/20 hover:bg-white hover:shadow-elevated"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                <benefit.icon className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <h3 className="mt-4 font-bold text-foreground">{benefit.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {benefit.description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
