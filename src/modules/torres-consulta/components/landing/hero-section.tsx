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
          className="landing-hero-photo absolute inset-0 h-full w-full object-cover object-[center_58%]"
        />
        <div className="landing-hero-cinematic-veil absolute inset-0" />
      </div>

      <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-4 pb-20 pt-28 text-center sm:px-6 sm:pb-24 sm:pt-32">
        <p className="landing-hero-enter landing-hero-enter-delay-1 text-[11px] font-bold uppercase tracking-[0.2em] text-[#ff9a5c] drop-shadow-[0_1px_8px_rgb(0_0_0_/_0.55)] sm:text-xs">
          A consulta que protege sua compra
        </p>

        <h1 className="landing-hero-enter landing-hero-enter-delay-2 mt-5 max-w-2xl text-balance text-[2rem] font-bold leading-[1.08] tracking-[-0.03em] text-white drop-shadow-[0_2px_16px_rgb(0_0_0_/_0.45)] sm:mt-6 sm:text-[2.75rem] lg:text-[3.25rem]">
          Saiba tudo sobre o veículo antes de fechar negócio
        </h1>

        <p className="landing-hero-enter landing-hero-enter-delay-3 mt-5 max-w-lg text-pretty text-[15px] font-medium leading-[1.65] text-white/90 drop-shadow-[0_1px_10px_rgb(0_0_0_/_0.5)] sm:text-base">
          Leilão, sinistro, roubo e restrições em um relatório claro. Digite a placa ou o chassi e
          receba o resultado na hora com a Torres Consulta.
        </p>

        <div className="landing-hero-enter landing-hero-enter-delay-4 mt-10 w-full max-w-xl sm:mt-12">
          <HeroConsultaForm />
        </div>
      </div>
    </section>
  );
}
