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
    title: "Passado do veículo",
    description: "Entenda a história do carro antes de fechar negócio.",
    items: [
      {
        icon: Gavel,
        title: "Leilão",
        description: "Saiba se o carro já foi a leilão e em que situação.",
      },
      {
        icon: AlertTriangle,
        title: "Sinistros",
        description: "Veja se houve acidente ou indenização no passado.",
      },
      {
        icon: Users,
        title: "Proprietários",
        description: "Quantas vezes o carro já mudou de dono, quando disponível.",
      },
    ],
  },
  {
    title: "Pendências e bloqueios",
    description: "Descubra se há algo que impede a transferência.",
    items: [
      {
        icon: Shield,
        title: "Roubo e furto",
        description: "Consultamos bases oficiais de ocorrência.",
      },
      {
        icon: Scale,
        title: "Restrições financeiras",
        description: "Financiamento, gravame e outras restrições no nome.",
      },
      {
        icon: Car,
        title: "Recall",
        description: "Confira se falta levar o carro na concessionária.",
      },
    ],
  },
  {
    title: "Visão geral do carro",
    description: "Nota e dados técnicos para fechar a compra com calma.",
    items: [
      {
        icon: Star,
        title: "Score veicular",
        description: "Nota que resume a situação geral do veículo.",
      },
      {
        icon: FileSearch,
        title: "Decodificação VIN",
        description: "Marca, modelo e versão a partir do chassi.",
      },
      {
        icon: Camera,
        title: "Fotos históricas",
        description: "Fotos registradas em vistorias e leilões anteriores.",
      },
    ],
  },
];

export function BenefitsSection() {
  return (
    <section className="bg-canvas py-20 sm:py-28" aria-labelledby="beneficios-title">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">O que você descobre</p>
          <h2
            id="beneficios-title"
            className="mt-3 text-2xl font-black tracking-tight text-foreground sm:text-4xl"
          >
            Compre sabendo o que o carro esconde
          </h2>
          <p className="mt-4 text-muted-foreground">
            Reunimos informações de fontes oficiais num relatório direto, para você decidir com
            segurança.
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
