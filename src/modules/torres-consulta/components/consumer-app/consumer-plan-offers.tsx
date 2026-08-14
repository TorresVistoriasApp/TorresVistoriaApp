import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import { ROUTES } from "@/config/routes";
import { PRICING_PLANS } from "@/modules/torres-consulta/components/landing/pricing-carousel";
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
        "group relative flex min-w-[15.5rem] shrink-0 flex-col overflow-hidden rounded-[1.35rem] border p-4 transition-all active:scale-[0.98] sm:min-w-0",
        plan.highlighted
          ? "border-primary/40 bg-gradient-to-b from-orange-50/90 to-white shadow-[0_12px_32px_rgb(234_88_12_/_0.12)] ring-1 ring-primary/20"
          : "border-white/90 bg-white/90 shadow-[0_8px_24px_rgb(15_23_42_/_0.05)]",
      )}
    >
      {plan.highlighted && (
        <span className="absolute right-3 top-3 rounded-full bg-primary px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary-foreground">
          Recomendado
        </span>
      )}

      <div className="flex items-start gap-3">
        <span
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
            plan.highlighted ? "bg-primary/15 text-primary" : "bg-slate-900/[0.05] text-foreground",
          )}
        >
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </span>
        <div className="min-w-0 flex-1 pr-8">
          <p className="text-sm font-bold text-foreground">{plan.name}</p>
          {!compact && (
            <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
              {PLAN_HIGHLIGHTS[planName]}
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-end justify-between gap-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Pagamento avulso
          </p>
          <p className="mt-0.5 flex items-baseline gap-1.5">
            <span className="text-xl font-black tracking-tight text-foreground">R$ {plan.price}</span>
            {plan.originalPrice && (
              <span className="text-xs text-muted-foreground line-through">R$ {plan.originalPrice}</span>
            )}
          </p>
        </div>
        <span
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-xl transition-colors",
            plan.highlighted
              ? "bg-primary text-primary-foreground"
              : "bg-slate-900/[0.05] text-foreground group-hover:bg-primary/10 group-hover:text-primary",
          )}
        >
          <ArrowRight className="h-4 w-4" />
        </span>
      </div>

      {!compact && (
        <p className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700">
          <Check className="h-3.5 w-3.5" />
          Cartão ou PIX · entrega imediata
        </p>
      )}
    </Link>
  );
}

export function ConsumerPlanOffersSection() {
  return (
    <section aria-label="Planos avulsos">
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-foreground">Planos avulsos</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Pague só pela consulta — sem pacote de créditos.
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-border/70 bg-white/80 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
          Avulsa
        </span>
      </div>

      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 scrollbar-none sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0">
        {PRICING_PLANS.map((plan) => (
          <ConsumerPlanOfferCard key={plan.name} planName={plan.name as ConsumerPlanName} />
        ))}
      </div>
    </section>
  );
}
