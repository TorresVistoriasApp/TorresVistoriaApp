import { ScrollReveal } from "./scroll-reveal";
import { PricingCarousel } from "./pricing-carousel";

export function PricingSection() {
  return (
    <section
      id="planos"
      className="relative overflow-hidden bg-slate-950 py-20 sm:py-28"
      aria-labelledby="planos-title"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgb(234_88_12_/_0.1),transparent_50%)]" />
      <div className="landing-grid-bg pointer-events-none absolute inset-0 opacity-[0.06]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <ScrollReveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Planos</p>
          <h2
            id="planos-title"
            className="mt-3 text-2xl font-black tracking-tight text-white sm:text-4xl"
          >
            Escolha o nível de análise ideal
          </h2>
          <p className="mt-4 text-slate-400">
            Compare o que cada plano inclui e pague só pela consulta que precisar.
          </p>
        </ScrollReveal>

        <ScrollReveal delayMs={100}>
          <PricingCarousel />
        </ScrollReveal>

        <ScrollReveal className="mt-10 text-center" delayMs={200}>
          <p className="text-sm text-slate-500">
            Todos os planos incluem download na hora e cópia salva na sua conta.
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
