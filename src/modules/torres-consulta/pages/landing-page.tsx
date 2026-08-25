import { LandingHeader } from "@/modules/torres-consulta/components/landing/landing-header";
import { LandingFooter } from "@/modules/torres-consulta/components/landing/landing-footer";
import { HeroSection } from "@/modules/torres-consulta/components/landing/hero-section";
import { TrustStrip } from "@/modules/torres-consulta/components/landing/trust-strip";
import { AudienceSection } from "@/modules/torres-consulta/components/landing/audience-section";
import { BenefitsSection } from "@/modules/torres-consulta/components/landing/benefits-section";
import { HowItWorksSection } from "@/modules/torres-consulta/components/landing/how-it-works-section";
import { ReportPreviewSection } from "@/modules/torres-consulta/components/landing/report-preview-section";
import { PricingSection } from "@/modules/torres-consulta/components/landing/pricing-section";
import { InspectorSection } from "@/modules/torres-consulta/components/landing/inspector-section";
import { FaqSection } from "@/modules/torres-consulta/components/landing/faq-section";
import { FinalCtaSection } from "@/modules/torres-consulta/components/landing/final-cta-section";
import { ScrollToTopButton } from "@/modules/torres-consulta/components/landing/scroll-to-top-button";
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
      <div className="consulta-page">
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-foreground"
        >
          Ir para o conteúdo
        </a>
        <LandingHeader />
        <main id="conteudo">
          <HeroSection />
          <TrustStrip />
          <AudienceSection />
          <BenefitsSection />
          <HowItWorksSection />
          <ReportPreviewSection />
          <PricingSection />
          <InspectorSection />
          <FaqSection />
          <FinalCtaSection />
        </main>
        <LandingFooter />
        <ScrollToTopButton />
      </div>
    </>
  );
}
