import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { ROUTES } from "@/config/routes";
import { HeroConsultaForm } from "./hero-consulta-form";
import { HeroVehicleVisual } from "./hero-vehicle-visual";

export function HeroSection() {
  return (
    <section
      id="inicio"
      className="relative flex min-h-[calc(100dvh-4rem)] flex-col justify-center overflow-hidden pt-20 pb-12 sm:pt-24 sm:pb-16 lg:min-h-[calc(100dvh-4.5rem)]"
    >
      {/* Background layers */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgb(234_88_12_/_0.12),transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_20%,rgb(14_165_233_/_0.06),transparent_40%)]" />
      <div className="landing-grid-bg pointer-events-none absolute inset-0 opacity-50" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-canvas" />

      {/* Partículas estáticas — sem animação para evitar repaint */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        {[
          "left-[12%] top-[18%]",
          "left-[78%] top-[12%]",
          "left-[65%] top-[45%]",
        ].map((pos) => (
          <span
            key={pos}
            className={`absolute h-1 w-1 rounded-full bg-primary/25 ${pos}`}
          />
        ))}
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Headline — centralizado */}
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-[2rem] font-black leading-[1.08] tracking-[-0.04em] text-foreground sm:text-5xl lg:text-[3.25rem] xl:text-6xl">
            Consulte o histórico completo de{" "}
            <span className="text-gradient-brand">qualquer veículo</span>
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg lg:text-xl">
            Descubra informações importantes antes de comprar utilizando apenas a placa ou o
            chassi.
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            É vistoriador profissional?{" "}
            <Link
              to={ROUTES.vistoriadores}
              className="inline-flex items-center gap-1 font-semibold text-sky-600 transition-colors hover:text-sky-700"
            >
              Emita laudos cautelares na Torres Vistoria
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </p>
        </div>

        {/* Form + Visual */}
        <div className="mt-10 grid items-center gap-10 lg:mt-14 lg:grid-cols-2 lg:gap-12 xl:gap-16">
          <div className="flex justify-center lg:justify-end">
            <HeroConsultaForm />
          </div>
          <div className="hidden lg:block">
            <HeroVehicleVisual />
          </div>
        </div>

        {/* Mobile visual — compact */}
        <div className="mt-8 lg:hidden">
          <HeroVehicleVisual />
        </div>
      </div>
    </section>
  );
}
