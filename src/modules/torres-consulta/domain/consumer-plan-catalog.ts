import { PRICING_PLANS } from "@/modules/torres-consulta/components/landing/pricing-carousel";
import { VehicleQueryType } from "@/core/integrations/ports/vehicle-lookup";

/** Planos comerciais B2C exibidos na landing. */
export type ConsumerPlanName = (typeof PRICING_PLANS)[number]["name"];

export const CONSUMER_PLAN_NAMES = PRICING_PLANS.map((plan) => plan.name) as ConsumerPlanName[];

/**
 * Créditos necessários por plano B2C.
 * Preparado para alinhar com pagamento/créditos quando o gateway existir.
 */
export const CONSUMER_PLAN_CREDITS: Record<ConsumerPlanName, number> = {
  Básico: 1,
  Completo: 10,
  Premium: 10,
};

/** Tipo técnico de consulta associado ao plano (integração futura). */
export const CONSUMER_PLAN_QUERY_TYPE: Record<ConsumerPlanName, VehicleQueryType> = {
  Básico: VehicleQueryType.BASIC,
  Completo: VehicleQueryType.COMPLETE,
  Premium: VehicleQueryType.COMPLETE,
};

export function getConsumerPlanCredits(planName: ConsumerPlanName): number {
  return CONSUMER_PLAN_CREDITS[planName];
}

export function getConsumerPlanQueryType(planName: ConsumerPlanName): VehicleQueryType {
  return CONSUMER_PLAN_QUERY_TYPE[planName];
}
