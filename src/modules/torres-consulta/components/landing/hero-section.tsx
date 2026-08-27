import { PUBLIC_IMAGES } from "@/shared/lib/public-images";
import { HeroConsultaForm } from "./hero-consulta-form";

const HERO_IMAGE = PUBLIC_IMAGES.consultations.hero;
const HERO_SRCSET =
  "/images/consultations/hero-bg-768.webp 768w, /images/consultations/hero-bg-1280.webp 1280w, /images/consultations/hero-bg-1920.webp 1920w";

export function HeroSection() {
  return (
    <section
      id="inicio"
      className="landing-hero-cinematic relative flex min-h-[100svh] flex-col overflow-hidden"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <img
          src={HERO_IMAGE}
          srcSet={HERO_SRCSET}
          sizes="100vw"
          alt=""
          width={1920}
          height={1280}
          decoding="async"
          fetchPriority="high"
          className="landing-hero-photo absolute inset-0 h-full w-full object-cover object-[center_42%]"
        />
        <div className="landing-hero-cinematic-veil absolute inset-0" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-4 pb-16 pt-24 text-center sm:px-6 sm:pb-20 sm:pt-28">
        <p className="landing-hero-enter landing-hero-enter-delay-1 text-[1.375rem] font-bold tracking-tight text-white sm:text-[1.625rem]">
          Torres <span className="text-primary">Consulta</span>
        </p>

        <h1 className="landing-hero-enter landing-hero-enter-delay-2 mt-5 max-w-2xl text-balance text-[1.875rem] font-bold leading-[1.12] tracking-tight text-white sm:mt-6 sm:text-[2.5rem] lg:text-[2.875rem]">
          Todo o histórico do veículo antes de fechar negócio
        </h1>

        <p className="landing-hero-enter landing-hero-enter-delay-3 mt-4 max-w-md text-pretty text-[15px] leading-relaxed text-white/70 sm:text-base">
          Leilão, sinistro, roubo e restrições em um relatório único. Informe a placa ou o chassi e
          receba o resultado na hora.
        </p>

        <div className="landing-hero-enter landing-hero-enter-delay-4 mt-8 w-full max-w-xl sm:mt-10">
          <HeroConsultaForm />
        </div>
      </div>
    </section>
  );
}
