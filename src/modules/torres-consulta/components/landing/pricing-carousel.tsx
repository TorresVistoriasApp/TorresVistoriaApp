import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Car,
  Check,
  ChevronLeft,
  ChevronRight,
  Crown,
  ShieldCheck,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { ROUTES } from "@/config/routes";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";

const ALL_FEATURES = [
  "Consulta por placa ou chassi",
  "Histórico básico do veículo",
  "Relatório em PDF",
  "Entrega imediata",
  "Sinistros e leilão",
  "Restrições financeiras",
  "Score veicular",
  "Suporte por e-mail",
  "Decodificação VIN",
  "Fotos históricas",
  "Histórico de proprietários",
  "Prioridade no suporte",
] as const;

const PLAN_FEATURE_KEYS: Record<string, readonly (typeof ALL_FEATURES)[number][]> = {
  Básico: ALL_FEATURES.slice(0, 4),
  Completo: ALL_FEATURES.slice(0, 8),
  Premium: ALL_FEATURES,
};

export const PRICING_PLANS = [
  {
    name: "Básico",
    icon: Car,
    price: "19,90",
    originalPrice: null,
    description: "Para a primeira checagem do carro.",
    highlighted: false,
  },
  {
    name: "Completo",
    icon: ShieldCheck,
    price: "39,90",
    originalPrice: "59,90",
    description: "O favorito de quem não quer correr risco.",
    highlighted: true,
  },
  {
    name: "Premium",
    icon: Crown,
    price: "69,90",
    originalPrice: "99,90",
    description: "Tudo que existe para analisar antes de fechar.",
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

const BILLING_OPTIONS = [
  { id: "avulsa", label: "Avulsa", available: true },
  { id: "pacote5", label: "5 consultas", available: false },
  { id: "pacote10", label: "10 consultas", available: false },
] as const;

const CARD_WIDTH = 320;
const CARD_GAP = 20;

function PlanDivider() {
  return (
    <div className="relative my-6 flex items-center">
      <div className="h-px flex-1 bg-white/10" />
      <span className="mx-3 h-1.5 w-1.5 rotate-45 bg-primary/80" aria-hidden />
      <div className="h-px flex-1 bg-white/10" />
    </div>
  );
}

function PlanSlide({
  plan,
  active,
  onSelect,
}: {
  plan: Plan;
  active: boolean;
  onSelect: () => void;
}) {
  const included = new Set(PLAN_FEATURE_KEYS[plan.name] ?? []);
  const Icon = plan.icon;

  return (
    <article
      onClick={onSelect}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect();
        }
      }}
      role="button"
      tabIndex={0}
      className={cn(
        "relative flex h-full w-[20rem] shrink-0 cursor-pointer flex-col rounded-2xl border p-6 transition-all duration-300 sm:w-[20rem]",
        plan.highlighted
          ? "border-primary/50 bg-slate-900/90 shadow-[0_0_40px_rgb(234_88_12_/_0.18)]"
          : "border-white/10 bg-slate-900/60 hover:border-white/20",
        active ? "scale-100 opacity-100" : "scale-[0.94] opacity-55",
        plan.highlighted && active && "scale-[1.02]",
      )}
    >
      {plan.highlighted && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
          Recomendado
        </span>
      )}

      <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-primary">
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </div>

      <h3 className="mt-5 text-lg font-bold text-white">{plan.name}</h3>

      <div className="mt-4 flex items-end gap-1.5">
        <span className="pb-1 text-sm text-slate-400">R$</span>
        <span className="text-4xl font-black tracking-tight text-white">{plan.price}</span>
        <span className="pb-1.5 text-sm text-slate-400">/ consulta</span>
      </div>
      {plan.originalPrice && (
        <p className="mt-1 text-xs text-slate-500">
          <span className="line-through">R$ {plan.originalPrice}</span>
          <span className="ml-2 font-semibold text-emerald-400">
            Economia de R${" "}
            {(parseFloat(plan.originalPrice.replace(",", ".")) - parseFloat(plan.price.replace(",", ".")))
              .toFixed(2)
              .replace(".", ",")}
          </span>
        </p>
      )}
      <p className="mt-1 text-xs text-slate-500">Pagamento avulso</p>

      <PlanDivider />

      <ul className="flex-1 space-y-2.5">
        {ALL_FEATURES.map((feature) => {
          const isIncluded = included.has(feature);
          return (
            <li
              key={feature}
              className={cn(
                "flex items-start gap-2.5 text-sm",
                isIncluded ? "text-slate-200" : "text-slate-600",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full",
                  isIncluded ? "bg-primary text-white" : "bg-white/5 text-slate-600",
                )}
              >
                {isIncluded ? (
                  <Check className="h-2.5 w-2.5" strokeWidth={3} />
                ) : (
                  <X className="h-2.5 w-2.5" strokeWidth={2.5} />
                )}
              </span>
              {feature}
            </li>
          );
        })}
      </ul>

      <Button
        variant={plan.highlighted ? "default" : "outline"}
        className={cn(
          "mt-6 h-11 w-full rounded-full text-xs font-bold uppercase tracking-wider",
          !plan.highlighted &&
            "border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white",
        )}
        asChild
        onClick={(event) => event.stopPropagation()}
      >
        <Link to={ROUTES.consultar}>
          {plan.highlighted ? "Consultar agora" : "Ver plano"}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
    </article>
  );
}

export function PricingCarousel() {
  const [activeIndex, setActiveIndex] = useState(DEFAULT_INDEX);
  const [billing, setBilling] = useState<(typeof BILLING_OPTIONS)[number]["id"]>("avulsa");
  const [trackOffset, setTrackOffset] = useState(0);
  const viewportRef = useRef<HTMLDivElement>(null);
  const planCount = PRICING_PLANS.length;

  const goTo = useCallback(
    (index: number) => {
      setActiveIndex(Math.max(0, Math.min(planCount - 1, index)));
    },
    [planCount],
  );

  const goPrev = () => goTo(activeIndex - 1);
  const goNext = () => goTo(activeIndex + 1);

  const updateTrackOffset = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const viewportWidth = viewport.offsetWidth;
    const slideStep = CARD_WIDTH + CARD_GAP;
    const centerOffset = viewportWidth / 2 - CARD_WIDTH / 2;
    setTrackOffset(centerOffset - activeIndex * slideStep);
  }, [activeIndex]);

  useEffect(() => {
    updateTrackOffset();
    window.addEventListener("resize", updateTrackOffset);
    return () => window.removeEventListener("resize", updateTrackOffset);
  }, [updateTrackOffset]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        setActiveIndex((index) => Math.max(0, index - 1));
      }
      if (event.key === "ArrowRight") {
        setActiveIndex((index) => Math.min(planCount - 1, index + 1));
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [planCount]);

  return (
    <div className="relative mt-12">
      <div className="mx-auto flex w-fit max-w-full rounded-full border border-white/10 bg-slate-900/80 p-1">
        {BILLING_OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            disabled={!option.available}
            onClick={() => option.available && setBilling(option.id)}
            className={cn(
              "rounded-full px-4 py-2 text-xs font-semibold transition-all sm:px-6 sm:text-sm",
              billing === option.id && option.available
                ? "bg-primary text-white shadow-glow"
                : option.available
                  ? "text-slate-400 hover:text-white"
                  : "cursor-not-allowed text-slate-600",
            )}
          >
            {option.label}
            {!option.available && (
              <span className="ml-1 hidden text-[10px] uppercase sm:inline">em breve</span>
            )}
          </button>
        ))}
      </div>

      <div
        ref={viewportRef}
        className="relative mt-10 overflow-hidden py-6"
        aria-roledescription="carrossel"
        aria-label="Planos de consulta veicular"
      >
        <div
          className="flex transition-transform duration-500 ease-out will-change-transform"
          style={{
            gap: `${CARD_GAP}px`,
            transform: `translateX(${trackOffset}px)`,
          }}
        >
          {PRICING_PLANS.map((plan, index) => (
            <PlanSlide
              key={plan.name}
              plan={plan}
              active={activeIndex === index}
              onSelect={() => goTo(index)}
            />
          ))}
        </div>

        <div
          className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-slate-950 to-transparent sm:w-24"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-slate-950 to-transparent sm:w-24"
          aria-hidden
        />
      </div>

      <div className="mt-2 flex items-center justify-center gap-4">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-full border-white/15 bg-slate-900/80 text-white hover:bg-white/10 hover:text-white"
          onClick={goPrev}
          disabled={activeIndex === 0}
          aria-label="Plano anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-2">
          {PRICING_PLANS.map((plan, index) => (
            <button
              key={plan.name}
              type="button"
              onClick={() => goTo(index)}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                activeIndex === index ? "w-6 bg-primary" : "w-2 bg-white/25 hover:bg-white/40",
              )}
              aria-label={`Ver plano ${plan.name}`}
              aria-current={activeIndex === index}
            />
          ))}
        </div>

        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-full border-white/15 bg-slate-900/80 text-white hover:bg-white/10 hover:text-white"
          onClick={goNext}
          disabled={activeIndex === planCount - 1}
          aria-label="Próximo plano"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
