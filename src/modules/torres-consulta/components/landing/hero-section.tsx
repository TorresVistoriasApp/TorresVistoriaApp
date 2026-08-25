import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { ROUTES } from "@/config/routes";
import { HeroConsultaForm } from "./hero-consulta-form";
import { HeroVehicleVisual } from "./hero-vehicle-visual";
import { LandingEyebrow } from "./landing-ui";

export function HeroSection() {
  return (
    <section id="inicio" className="landing-hero-bg relative pt-24 pb-14 sm:pt-28 sm:pb-16 lg:pt-32 lg:pb-20">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-14">
          <div className="flex flex-col">
            <LandingEyebrow>Consulta veicular completa</LandingEyebrow>

            <h1 className="mt-4 text-balance text-[2.125rem] font-bold leading-[1.05] text-foreground sm:text-[2.75rem] lg:text-[3.125rem]">
              Todo o histórico do veículo antes de fechar negócio
            </h1>

            <p className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-[17px]">
              Leilão, sinistro, roubo, débitos e restrições em um relatório único e fácil de ler.
              Informe a placa ou o chassi e receba o resultado na hora.
            </p>

            <div className="mt-7 lg:mt-8">
              <HeroConsultaForm />
            </div>

            <div className="mt-6 lg:hidden">
              <HeroVehicleVisual compact />
            </div>

            <p className="mt-6 text-sm text-muted-foreground">
              Trabalha com vistoria cautelar?{" "}
              <Link
                to={ROUTES.vistoriaLogin}
                className="group inline-flex items-center gap-1 font-semibold text-foreground underline decoration-border decoration-2 underline-offset-4 transition-colors hover:text-primary hover:decoration-primary/40"
              >
                Conheça a Torres Vistoria
                <ArrowRight
                  className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                  aria-hidden
                />
              </Link>
            </p>
          </div>

          <div className="hidden lg:block lg:pt-2">
            <HeroVehicleVisual />
          </div>
        </div>
      </div>
    </section>
  );
}
