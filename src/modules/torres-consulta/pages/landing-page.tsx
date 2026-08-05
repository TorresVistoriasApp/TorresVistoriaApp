import { LandingHeader } from "@/modules/torres-consulta/components/landing/landing-header";
import { LandingFooter } from "@/modules/torres-consulta/components/landing/landing-footer";
import { HeroSection } from "@/modules/torres-consulta/components/landing/hero-section";
import { BenefitsSection } from "@/modules/torres-consulta/components/landing/benefits-section";
import { HowItWorksSection } from "@/modules/torres-consulta/components/landing/how-it-works-section";
import { PricingSection } from "@/modules/torres-consulta/components/landing/pricing-section";
import { FaqSection } from "@/modules/torres-consulta/components/landing/faq-section";
import { LANDING_SEO, PageSeo } from "@/modules/torres-consulta/components/seo/page-seo";
import { ROUTES } from "@/config/routes";

export function LandingPage() {
  return (
    <>
      <PageSeo
        title={LANDING_SEO.title}
        description={LANDING_SEO.description}
        canonicalPath={ROUTES.consultaLanding}
        schema={LANDING_SEO.schema}
      />
      <div className="min-h-dvh bg-canvas">
        <LandingHeader />
        <main>
          <HeroSection />
          <BenefitsSection />
          <HowItWorksSection />
          <PricingSection />
          <FaqSection />
        </main>
        <LandingFooter />
      </div>
    </>
  );
}
