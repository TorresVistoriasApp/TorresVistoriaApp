import { Link } from "react-router-dom";
import { ArrowRight, Search } from "lucide-react";
import { ROUTES } from "@/config/routes";
import { Button } from "@/shared/ui/button";
import { ScrollReveal } from "./scroll-reveal";
import { LandingSection } from "./landing-ui";

export function FinalCtaSection() {
  return (
    <LandingSection
      tone="cinematic"
      aria-labelledby="final-cta-title"
      className="!py-20 sm:!py-24 lg:!py-28"
    >
      <ScrollReveal>
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary sm:text-[11px]">
            Torres Consulta
          </p>
          <h2
            id="final-cta-title"
            className="mt-5 text-balance text-[1.875rem] font-bold leading-[1.1] tracking-[-0.025em] text-white sm:text-[2.125rem] lg:text-[2.5rem]"
          >
            Pronto para consultar o veículo?
          </h2>
          <p className="mt-4 text-pretty text-[15px] font-medium leading-[1.7] text-white/55 sm:text-base">
            Informe a placa ou o chassi e receba o histórico completo em minutos. Cadastro grátis,
            sem compromisso.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button size="lg" className="shadow-glow sm:min-w-[14rem]" asChild>
              <Link to={ROUTES.consultar}>
                <Search className="h-4 w-4" aria-hidden />
                Consultar agora
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/15 bg-transparent text-white hover:bg-white/[0.06] hover:text-white"
              asChild
            >
              <Link to={ROUTES.relatorioExemplo}>Ver relatório de exemplo</Link>
            </Button>
          </div>
        </div>
      </ScrollReveal>
    </LandingSection>
  );
}
