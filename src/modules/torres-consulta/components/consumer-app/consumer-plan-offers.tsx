import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import { ROUTES } from "@/config/routes";
import { PRICING_PLANS } from "@/modules/torres-consulta/components/landing/pricing-carousel";
import { ConsumerSectionHeading } from "@/modules/torres-consulta/components/consumer-app/consumer-page-header";
import type { ConsumerPlanName } from "@/modules/torres-consulta/domain/consumer-plan-catalog";
import { cn } from "@/shared/lib/utils";

const PLAN_HIGHLIGHTS: Record<ConsumerPlanName, string> = {
  Básico: "Histórico básico + PDF imediato",
  Completo: "Sinistros, leilão e score veicular",
  Premium: "VIN, fotos e histórico completo",
};

interface ConsumerPlanOfferCardProps {
  planName: ConsumerPlanName;
  compact?: boolean;
}

export function ConsumerPlanOfferCard({ planName, compact }: ConsumerPlanOfferCardProps) {
  const plan = PRICING_PLANS.find((item) => item.name === planName);
  if (!plan) return null;

  const Icon = plan.icon;
  const href = `${ROUTES.consultaAppNovaConsulta}?plano=${encodeURIComponent(plan.name)}`;

  return (
    <Link
      to={href}
      className={cn(
        "ui-panel ui-panel-interactive group relative flex min-w-[15.5rem] shrink-0 flex-col p-5 sm:min-w-0",
        plan.highlighted && "landing-card-featured",
      )}
    >
      {plan.highlighted && (
        <span className="absolute right-4 top-4 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.07em] text-primary-foreground">
          Recomendado
        </span>
      )}

      <span
        className={cn("ui-icon-box h-10 w-10", !plan.highlighted && "ui-icon-box-neutral")}
      >
        <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
      </span>

      <p className="mt-4 pr-20 text-sm font-bold text-foreground">{plan.name}</p>
      {!compact && (
        <p className="mt-0.5 text-[13px] leading-relaxed text-muted-foreground">
          {PLAN_HIGHLIGHTS[planName]}
        </p>
      )}

      <div className="mt-4 flex items-end justify-between gap-3">
        <p className="flex items-baseline gap-1.5">
          <span className="ui-metric text-[1.5rem] font-bold leading-none text-foreground">
            R$ {plan.price}
          </span>
          {plan.originalPrice && (
            <span className="text-xs text-subtle-foreground line-through">
              R$ {plan.originalPrice}
            </span>
          )}
        </p>
        <span
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-full transition-colors duration-150",
            plan.highlighted
              ? "bg-primary text-primary-foreground"
              : "border border-border bg-muted text-foreground group-hover:bg-brand-subtle group-hover:text-primary",
          )}
        >
          <ArrowRight className="h-4 w-4" aria-hidden />
        </span>
      </div>

      {!compact && (
        <p className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-medium text-success">
          <Check className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
          Cartão ou PIX · entrega imediata
        </p>
      )}
    </Link>
  );
}

export function ConsumerPlanOffersSection() {
  return (
    <section aria-label="Planos avulsos">
      <ConsumerSectionHeading
        title="Planos avulsos"
        description="Pague só pela consulta — sem pacote de créditos."
      />

      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 scrollbar-none sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 sm:gap-4">
        {PRICING_PLANS.map((plan) => (
          <ConsumerPlanOfferCard key={plan.name} planName={plan.name as ConsumerPlanName} />
        ))}
      </div>
    </section>
  );
}
