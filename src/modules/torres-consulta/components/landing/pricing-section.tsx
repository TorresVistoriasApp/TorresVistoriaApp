import { ScrollReveal } from "./scroll-reveal";
import { SectionHeader } from "./section-header";
import { PricingCarousel } from "./pricing-carousel";
import { LandingSection } from "./landing-ui";

export function PricingSection() {
  return (
    <LandingSection id="planos" tone="surface" aria-labelledby="planos-title">
      <ScrollReveal>
        <SectionHeader
          eyebrow="Investimento que evita prejuízo"
          title="Pague só pela consulta que precisar"
          description="Sem assinatura e sem fidelidade. Escolha o nível de análise e compre com a segurança que a Torres entrega."
          titleId="planos-title"
        />
      </ScrollReveal>

      <ScrollReveal delayMs={60}>
        <PricingCarousel />
      </ScrollReveal>

      <p className="mt-8 text-center text-sm font-medium tracking-wide text-muted-foreground">
        Todos os planos incluem download na hora e cópia salva na sua conta.
      </p>
    </LandingSection>
  );
}
