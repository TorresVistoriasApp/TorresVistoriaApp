import { Link } from "react-router-dom";
import { ArrowRight, Search } from "lucide-react";
import { ROUTES } from "@/config/routes";
import { Button } from "@/shared/ui/button";
import { ScrollReveal } from "./scroll-reveal";
import { LandingSection } from "./landing-ui";

export function FinalCtaSection() {
  return (
    <LandingSection tone="cinematic" aria-labelledby="final-cta-title" className="!py-16 sm:!py-20 lg:!py-24">
      <ScrollReveal>
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary sm:text-xs">
            Torres Consulta
          </p>
          <h2
            id="final-cta-title"
            className="mt-4 text-balance text-[1.75rem] font-bold leading-[1.12] tracking-tight text-white sm:text-[2rem] lg:text-[2.375rem]"
          >
            Pronto para consultar o veículo?
          </h2>
          <p className="mt-4 text-pretty text-[15px] leading-relaxed text-white/65 sm:text-base">
            Informe a placa ou o chassi e receba o histórico completo em minutos. Cadastro grátis,
            sem compromisso.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button size="lg" className="shadow-glow sm:min-w-[13.5rem]" asChild>
              <Link to={ROUTES.consultar}>
                <Search className="h-4 w-4" aria-hidden />
                Consultar agora
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white"
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
