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

      <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-border bg-border lg:mt-12 lg:grid-cols-3">
        {CATEGORIES.map((category, index) => (
          <ScrollReveal key={category.title} delayMs={index * 60} className="bg-card">
            <div className="flex h-full flex-col p-6 sm:p-7">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-muted/60 text-foreground">
                <category.icon className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
              </span>
              <h3 className="mt-5 text-[17px] font-bold tracking-tight text-foreground">
                {category.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                {category.description}
              </p>
              <ul className="mt-5 flex flex-1 flex-col gap-2.5 border-t border-border pt-5">
                {category.items.map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-sm text-foreground">
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
