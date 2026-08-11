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

const CATEGORIES: {
  title: string;
  description: string;
  items: { icon: LucideIcon; title: string; description: string }[];
}[] = [
  {
    title: "Histórico do veículo",
    description: "Saiba o que aconteceu com o carro antes de você.",
    items: [
      {
        icon: Gavel,
        title: "Leilão",
        description: "Verifique se passou por leilão e em quais condições.",
      },
      {
        icon: AlertTriangle,
        title: "Sinistros",
        description: "Acidentes, indenizações e registros anteriores.",
      },
      {
        icon: Users,
        title: "Proprietários",
        description: "Transferências anteriores, quando permitido por lei.",
      },
    ],
  },
  {
    title: "Situação legal e financeira",
    description: "Evite surpresas com pendências e restrições.",
    items: [
      {
        icon: Shield,
        title: "Roubo e furto",
        description: "Consulta em bases oficiais de ocorrência.",
      },
      {
        icon: Scale,
        title: "Restrições financeiras",
        description: "Gravames, alienação fiduciária e bloqueios.",
      },
      {
        icon: Car,
        title: "Recall",
        description: "Campanhas pendentes para o modelo.",
      },
    ],
  },
  {
    title: "Análise completa",
    description: "Dados técnicos e visão consolidada da situação.",
    items: [
      {
        icon: Star,
        title: "Score veicular",
        description: "Avaliação consolidada da situação geral.",
      },
      {
        icon: FileSearch,
        title: "Decodificação VIN",
        description: "Dados técnicos a partir do chassi.",
      },
      {
        icon: Camera,
        title: "Fotos históricas",
        description: "Imagens de vistorias e leilões anteriores.",
      },
    ],
  },
];

export function BenefitsSection() {
  return (
    <section className="bg-canvas py-20 sm:py-28" aria-labelledby="beneficios-title">
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
            Dados consolidados de múltiplas fontes oficiais, organizados em um único relatório fácil
            de entender.
          </p>
        </ScrollReveal>

        <div className="mt-14 grid gap-8 lg:grid-cols-3">
          {CATEGORIES.map((category, categoryIndex) => (
            <ScrollReveal key={category.title} delayMs={categoryIndex * 80}>
              <div className="flex h-full flex-col rounded-2xl border border-border/50 bg-white p-6 shadow-soft sm:p-7">
                <h3 className="text-lg font-bold text-foreground">{category.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{category.description}</p>
                <ul className="mt-6 flex flex-1 flex-col gap-4">
                  {category.items.map((item) => (
                    <li key={item.title} className="flex gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <item.icon className="h-5 w-5" strokeWidth={1.5} />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{item.title}</p>
                        <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
