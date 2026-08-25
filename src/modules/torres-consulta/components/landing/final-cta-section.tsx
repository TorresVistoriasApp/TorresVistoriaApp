import { Link } from "react-router-dom";
import { ArrowRight, Search } from "lucide-react";
import { ROUTES } from "@/config/routes";
import { Button } from "@/shared/ui/button";
import { ScrollReveal } from "./scroll-reveal";
import { LandingSection } from "./landing-ui";

export function FinalCtaSection() {
  return (
    <LandingSection aria-labelledby="final-cta-title">
      <ScrollReveal>
        <div className="landing-hairline-grid overflow-hidden rounded-xl border border-border bg-card px-6 py-12 text-center shadow-card sm:px-10 sm:py-14">
          <div className="mx-auto max-w-xl">
            <h2
              id="final-cta-title"
              className="text-balance text-[1.75rem] font-bold leading-[1.12] text-foreground sm:text-[2rem] lg:text-[2.25rem]"
            >
              Pronto para consultar o veículo?
            </h2>
            <p className="mt-4 text-pretty text-[15px] leading-relaxed text-muted-foreground sm:text-base">
              Informe a placa ou o chassi e receba o histórico completo em minutos. Cadastro grátis,
              sem compromisso.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button size="lg" className="sm:min-w-[13.5rem]" asChild>
                <Link to={ROUTES.consultar}>
                  <Search className="h-4 w-4" aria-hidden />
                  Consultar agora
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to={ROUTES.relatorioExemplo}>Ver relatório de exemplo</Link>
              </Button>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </LandingSection>
  );
}
