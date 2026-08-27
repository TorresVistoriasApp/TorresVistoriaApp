import { Gavel, Shield, Star } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { ScrollReveal } from "./scroll-reveal";
import { SectionHeader } from "./section-header";
import { LandingSection } from "./landing-ui";

const CATEGORIES: {
  title: string;
  description: string;
  icon: LucideIcon;
  items: string[];
}[] = [
  {
    title: "Passado do veículo",
    description: "Entenda a história do carro antes de fechar negócio.",
    icon: Gavel,
    items: ["Leilão e sinistros", "Histórico de proprietários", "Recall e manutenções"],
  },
  {
    title: "Pendências e bloqueios",
    description: "Descubra se há algo que impede a transferência.",
    icon: Shield,
    items: ["Roubo e furto", "Restrições financeiras", "Gravames e débitos"],
  },
  {
    title: "Visão completa",
    description: "Dados técnicos e score para decidir com calma.",
    icon: Star,
    items: ["Score veicular", "Decodificação do chassi", "Fotos históricas"],
  },
];

export function BenefitsSection() {
  return (
    <LandingSection tone="surface" aria-labelledby="beneficios-title">
      <ScrollReveal>
        <SectionHeader
          eyebrow="O que você descobre"
          title="Compre sabendo o que o carro esconde"
          description="Informações de fontes oficiais reunidas num relatório direto, para você decidir com segurança."
          titleId="beneficios-title"
        />
      </ScrollReveal>

      <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-[rgb(16_21_28_/_0.08)] bg-[rgb(16_21_28_/_0.08)] lg:mt-14 lg:grid-cols-3">
        {CATEGORIES.map((category, index) => (
          <ScrollReveal key={category.title} delayMs={index * 60} className="bg-card">
            <div className="flex h-full flex-col p-7 sm:p-8">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-[rgb(16_21_28_/_0.08)] bg-muted/40 text-foreground">
                <category.icon className="h-5 w-5" strokeWidth={1.5} aria-hidden />
              </span>
              <h3 className="mt-6 text-lg font-bold tracking-[-0.02em] text-foreground">
                {category.title}
              </h3>
              <p className="mt-2 text-[15px] leading-[1.65] text-muted-foreground">
                {category.description}
              </p>
              <ul className="mt-6 flex flex-1 flex-col gap-3 border-t border-[rgb(16_21_28_/_0.06)] pt-6">
                {category.items.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm font-medium text-foreground">
                    <span className="h-1 w-1 shrink-0 rounded-full bg-primary" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </ScrollReveal>
        ))}
      </div>
    </LandingSection>
  );
}
