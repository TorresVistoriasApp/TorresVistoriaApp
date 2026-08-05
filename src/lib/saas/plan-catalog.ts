import {
  SaasFeature,
  SubscriptionPlan,
  type PlanLimits,
} from "@/lib/saas/types";

const STARTER_FEATURES = new Set<SaasFeature>([SaasFeature.RECURRING_BILLING]);

const PROFESSIONAL_FEATURES = new Set<SaasFeature>([
  SaasFeature.RECURRING_BILLING,
  SaasFeature.MULTI_BRANCH,
  SaasFeature.TEAMS,
  SaasFeature.PUBLIC_API,
  SaasFeature.TORRES_CONSULTA,
]);

const ENTERPRISE_FEATURES = new Set<SaasFeature>([
  ...PROFESSIONAL_FEATURES,
  SaasFeature.MARKETPLACE,
  SaasFeature.CUSTOM_PERMISSIONS,
  SaasFeature.ERP_SYNC,
  SaasFeature.CRM_SYNC,
  SaasFeature.FLUTTER_MOBILE,
]);

/** Catálogo estático de limites por plano (fonte única até billing dinâmico). */
export const PLAN_CATALOG: Record<SubscriptionPlan, PlanLimits> = {
  [SubscriptionPlan.STARTER]: {
    plan: SubscriptionPlan.STARTER,
    label: "Starter",
    maxUsers: 3,
    maxInspectionsPerMonth: 50,
    maxStorageGb: 5,
    features: STARTER_FEATURES,
  },
  [SubscriptionPlan.PROFESSIONAL]: {
    plan: SubscriptionPlan.PROFESSIONAL,
    label: "Professional",
    maxUsers: 15,
    maxInspectionsPerMonth: 500,
    maxStorageGb: 50,
    features: PROFESSIONAL_FEATURES,
  },
  [SubscriptionPlan.ENTERPRISE]: {
    plan: SubscriptionPlan.ENTERPRISE,
    label: "Enterprise",
    maxUsers: null,
    maxInspectionsPerMonth: null,
    maxStorageGb: null,
    features: ENTERPRISE_FEATURES,
  },
};

export function isSubscriptionPlan(value: string | null | undefined): value is SubscriptionPlan {
  return (
    value === SubscriptionPlan.STARTER ||
    value === SubscriptionPlan.PROFESSIONAL ||
    value === SubscriptionPlan.ENTERPRISE
  );
}

export function resolveSubscriptionPlan(value: string | null | undefined): SubscriptionPlan {
  return isSubscriptionPlan(value) ? value : SubscriptionPlan.STARTER;
}

export function getPlanLimits(planCode: string | null | undefined): PlanLimits {
  return PLAN_CATALOG[resolveSubscriptionPlan(planCode)];
}

export function planHasFeature(
  planCode: string | null | undefined,
  feature: SaasFeature,
): boolean {
  return getPlanLimits(planCode).features.has(feature);
}
