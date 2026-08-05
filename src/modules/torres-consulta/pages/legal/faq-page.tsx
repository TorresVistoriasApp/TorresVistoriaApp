import { Link } from "react-router-dom";
import { ROUTES } from "@/config/routes";
import { FaqSection } from "@/modules/torres-consulta/components/landing/faq-section";
import { LandingHeader } from "@/modules/torres-consulta/components/landing/landing-header";
import { LandingFooter } from "@/modules/torres-consulta/components/landing/landing-footer";
import { PageSeo } from "@/modules/torres-consulta/components/seo/page-seo";

export function FaqPage() {
  return (
    <>
      <PageSeo
        title="Perguntas Frequentes"
        description="Tire suas dúvidas sobre consulta veicular, relatórios e a plataforma Torres Consulta."
      />
      <div className="min-h-dvh bg-canvas">
        <LandingHeader />
        <main className="pt-20">
          <div className="mx-auto max-w-3xl px-4 py-8 text-center">
            <h1 className="text-3xl font-black tracking-tight text-foreground">
              Perguntas Frequentes
            </h1>
            <p className="mt-2 text-muted-foreground">
              Não encontrou sua resposta?{" "}
              <Link to={ROUTES.consultaLanding} className="font-semibold text-primary hover:underline">
                Entre em contato
              </Link>
            </p>
          </div>
          <FaqSection />
        </main>
        <LandingFooter />
      </div>
    </>
  );
}
