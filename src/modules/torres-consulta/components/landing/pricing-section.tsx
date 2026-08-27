import { ScrollReveal } from "./scroll-reveal";
import { SectionHeader } from "./section-header";
import { PricingCarousel } from "./pricing-carousel";
import { LandingSection } from "./landing-ui";

export function PricingSection() {
  return (
    <LandingSection id="planos" tone="surface" aria-labelledby="planos-title">
      <ScrollReveal>
        <SectionHeader
          eyebrow="Planos"
          title="Pague só pela consulta que precisar"
          description="Sem assinatura e sem fidelidade. Compare o que cada plano inclui e escolha o nível de análise."
          titleId="planos-title"
        />
      </ScrollReveal>

      <ScrollReveal delayMs={60}>
        <PricingCarousel />
      </ScrollReveal>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Todos os planos incluem download na hora e cópia salva na sua conta.
      </p>
    </LandingSection>
  );
}
