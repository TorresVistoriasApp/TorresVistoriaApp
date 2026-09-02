import { PRICING_PLANS } from "@/modules/torres-consulta/components/landing/pricing-carousel";
import { VehicleQueryType } from "@/core/integrations/ports/vehicle-lookup";

/** Planos comerciais B2C exibidos na landing e na área do consumidor. */
export type ConsumerPlanName = (typeof PRICING_PLANS)[number]["name"];

export const CONSUMER_PLAN_NAMES = PRICING_PLANS.map((plan) => plan.name) as ConsumerPlanName[];

/**
 * Custo interno do ledger, se o adaptador existir.
 * B2B cobra por serviço (laudo ou laudo + consulta); B2C cobra valor avulso.
 */
export const CONSUMER_PLAN_LEDGER_CREDITS: Record<ConsumerPlanName, number> = {
  Básico: 1,
  Completo: 10,
  Premium: 10,
};

/** @deprecated Use getConsumerPlanPriceLabel — a UI cobra em reais, não em saldo. */
export const CONSUMER_PLAN_CREDITS = CONSUMER_PLAN_LEDGER_CREDITS;

export const CONSUMER_PLAN_QUERY_TYPE: Record<ConsumerPlanName, VehicleQueryType> = {
  Básico: VehicleQueryType.BASIC,
  Completo: VehicleQueryType.COMPLETE,
  Premium: VehicleQueryType.COMPLETE,
};

export function getConsumerPlanByName(planName: ConsumerPlanName) {
  return PRICING_PLANS.find((plan) => plan.name === planName);
}

/** Preço avulso formatado para exibição (ex.: "39,90"). */
export function getConsumerPlanPriceDisplay(planName: ConsumerPlanName): string {
  return getConsumerPlanByName(planName)?.price ?? "0,00";
}

/** Label comercial B2C (ex.: "R$ 39,90"). */
export function getConsumerPlanPriceLabel(planName: ConsumerPlanName): string {
  return `R$ ${getConsumerPlanPriceDisplay(planName)}`;
}

/** @deprecated Ledger interno — não exibir na UI. */
export function getConsumerPlanCredits(planName: ConsumerPlanName): number {
  return CONSUMER_PLAN_LEDGER_CREDITS[planName];
}

export function getConsumerPlanQueryType(planName: ConsumerPlanName): VehicleQueryType {
  return CONSUMER_PLAN_QUERY_TYPE[planName];
}
