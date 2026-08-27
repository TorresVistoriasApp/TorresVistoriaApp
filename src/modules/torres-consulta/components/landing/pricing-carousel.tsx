import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight, Car, Check, Crown, ShieldCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { ROUTES } from "@/config/routes";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";

const PLAN_FEATURES: Record<string, readonly string[]> = {
  Básico: [
    "Consulta por placa ou chassi",
    "Histórico essencial do veículo",
    "Relatório em PDF",
    "Entrega na hora",
  ],
  Completo: [
    "Tudo do plano Básico",
    "Sinistros e leilão",
    "Restrições financeiras",
    "Score veicular",
    "Suporte por email",
  ],
  Premium: [
    "Tudo do plano Completo",
    "Decodificação do chassi",
    "Fotos históricas",
    "Histórico de proprietários",
    "Prioridade no suporte",
  ],
};

export const PRICING_PLANS = [
  {
    name: "Básico",
    icon: Car,
    price: "19,90",
    originalPrice: null,
    description: "Ideal para uma checagem rápida antes de visitar o carro.",
    highlighted: false,
  },
  {
    name: "Completo",
    icon: ShieldCheck,
    price: "39,90",
    originalPrice: "59,90",
    description: "O mais escolhido por quem quer comprar sem surpresa.",
    highlighted: true,
  },
  {
    name: "Premium",
    icon: Crown,
    price: "69,90",
    originalPrice: "99,90",
    description: "Análise máxima para fechar negócio com total clareza.",
    highlighted: false,
  },
] as const satisfies ReadonlyArray<{
  name: string;
  icon: LucideIcon;
  price: string;
  originalPrice: string | null;
  description: string;
  highlighted: boolean;
}>;

type Plan = (typeof PRICING_PLANS)[number];

const DEFAULT_INDEX = Math.max(0, PRICING_PLANS.findIndex((plan) => plan.highlighted));

function toNumber(value: string) {
  return Number.parseFloat(value.replace(",", "."));
}

function PlanCard({ plan }: { plan: Plan }) {
  const features = PLAN_FEATURES[plan.name] ?? [];
  const Icon = plan.icon;
  const discount = plan.originalPrice
    ? (toNumber(plan.originalPrice) - toNumber(plan.price)).toFixed(2).replace(".", ",")
    : null;

  return (
    <article
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-2xl border bg-card",
        plan.highlighted
          ? "border-primary/30 shadow-[0_20px_48px_rgb(16_21_28_/_0.08)]"
          : "border-[rgb(16_21_28_/_0.08)]",
      )}
    >
      <div
        className={cn(
          "flex items-center justify-between gap-2 border-b px-6 py-4",
          plan.highlighted
            ? "border-primary/10 bg-brand-subtle/50"
            : "border-[rgb(16_21_28_/_0.06)]",
        )}
      >
        <span className="flex items-center gap-2.5 text-sm font-bold tracking-tight text-foreground">
          <Icon
            className={cn("h-4 w-4", plan.highlighted ? "text-primary" : "text-subtle-foreground")}
            strokeWidth={1.5}
            aria-hidden
          />
          {plan.name}
        </span>
        {plan.highlighted && (
          <span className="rounded-md bg-primary px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-primary-foreground">
            Mais popular
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-6 sm:p-7">
        <p className="text-[15px] leading-[1.65] text-muted-foreground">{plan.description}</p>

        <div className="mt-6 flex items-end gap-1.5">
          <span className="pb-1.5 text-sm font-medium text-muted-foreground">R$</span>
          <span className="tabular text-[2.375rem] font-bold leading-none tracking-[-0.03em] text-foreground">
            {plan.price}
          </span>
          <span className="pb-1.5 text-sm text-muted-foreground">por consulta</span>
        </div>

        {plan.originalPrice && (
          <p className="mt-2 text-xs">
            <span className="text-subtle-foreground line-through">R$ {plan.originalPrice}</span>
            <span className="ml-2 font-semibold text-success">economize R$ {discount}</span>
          </p>
        )}

        <ul className="mt-6 flex-1 space-y-3 border-t border-[rgb(16_21_28_/_0.06)] pt-6">
          {features.map((feature) => (
            <li key={feature} className="flex items-start gap-2.5 text-sm font-medium text-foreground">
              <Check
                className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary"
                strokeWidth={2.5}
                aria-hidden
              />
              {feature}
            </li>
          ))}
        </ul>

        <Button
          variant={plan.highlighted ? "default" : "outline"}
          className={cn("mt-7 w-full tracking-wide", plan.highlighted && "shadow-glow")}
          asChild
        >
          <Link to={ROUTES.consultar}>
            {plan.highlighted ? "Quero este plano" : "Escolher este plano"}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </Button>
      </div>
    </article>
  );
}

/** Scroll-snap nativo: rolagem fluida no mobile sem cálculo de transform em JS. */
function PricingScrollerMobile() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(DEFAULT_INDEX);

  const scrollToIndex = useCallback((index: number) => {
    const scroller = scrollerRef.current;
    const slide = scroller?.children[index] as HTMLElement | undefined;
    if (!scroller || !slide) return;
    scroller.scrollTo({ left: slide.offsetLeft - scroller.offsetLeft, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const scroller = scrollerRef.current;
    const slide = scroller?.children[DEFAULT_INDEX] as HTMLElement | undefined;
    if (!scroller || !slide) return;
    scroller.scrollLeft = slide.offsetLeft - scroller.offsetLeft;
  }, []);

  const handleScroll = () => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const slides = Array.from(scroller.children) as HTMLElement[];
    const center = scroller.scrollLeft + scroller.clientWidth / 2;
    let nearest = 0;
    let smallest = Number.POSITIVE_INFINITY;
    slides.forEach((slide, index) => {
      const distance = Math.abs(slide.offsetLeft - scroller.offsetLeft + slide.offsetWidth / 2 - center);
      if (distance < smallest) {
        smallest = distance;
        nearest = index;
      }
    });
    setActiveIndex(nearest);
  };

  return (
    <div className="lg:hidden">
      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        className="scrollbar-none -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2"
        aria-label="Planos de consulta veicular"
      >
        {PRICING_PLANS.map((plan) => (
          <div key={plan.name} className="w-[19rem] max-w-[85vw] shrink-0 snap-center">
            <PlanCard plan={plan} />
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-center gap-2">
        {PRICING_PLANS.map((plan, index) => (
          <button
            key={plan.name}
            type="button"
            onClick={() => scrollToIndex(index)}
            className="flex h-8 min-h-8 w-6 items-center justify-center"
            aria-label={`Ver plano ${plan.name}`}
            aria-current={activeIndex === index}
          >
            <span
              className={cn(
                "h-1.5 rounded-full transition-all duration-200",
                activeIndex === index ? "w-5 bg-primary" : "w-1.5 bg-border-strong",
              )}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

function PricingGridDesktop() {
  return (
    <div className="hidden items-stretch lg:grid lg:grid-cols-3 lg:gap-5">
      {PRICING_PLANS.map((plan) => (
        <PlanCard key={plan.name} plan={plan} />
      ))}
    </div>
  );
}

export function PricingCarousel() {
  return (
    <div className="mt-10 lg:mt-12">
      <PricingGridDesktop />
      <PricingScrollerMobile />
    </div>
  );
}
