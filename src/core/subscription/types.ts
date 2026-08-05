/**
 * Planos SaaS do tenant (espelha `companies.subscription_plan`).
 * Limites e feature flags são aplicados no frontend até integração de billing.
 */
export const SubscriptionPlan = {
  STARTER: "starter",
  PROFESSIONAL: "professional",
  ENTERPRISE: "enterprise",
} as const;

export type SubscriptionPlan = (typeof SubscriptionPlan)[keyof typeof SubscriptionPlan];

/** Status do tenant (`companies.status`). */
export const CompanyTenantStatus = {
  TRIAL: "trial",
  ACTIVE: "active",
  SUSPENDED: "suspended",
  CANCELED: "canceled",
} as const;

export type CompanyTenantStatus = (typeof CompanyTenantStatus)[keyof typeof CompanyTenantStatus];

/** Features reservadas para rollout gradual por plano. */
export const SaasFeature = {
  MULTI_BRANCH: "multi_branch",
  TEAMS: "teams",
  MARKETPLACE: "marketplace",
  PUBLIC_API: "public_api",
  CUSTOM_PERMISSIONS: "custom_permissions",
  RECURRING_BILLING: "recurring_billing",
  TORRES_CONSULTA: "torres_consulta",
  ERP_SYNC: "erp_sync",
  CRM_SYNC: "crm_sync",
  FLUTTER_MOBILE: "flutter_mobile",
} as const;

export type SaasFeature = (typeof SaasFeature)[keyof typeof SaasFeature];

export type PlanLimits = {
  plan: SubscriptionPlan;
  label: string;
  maxUsers: number | null;
  maxInspectionsPerMonth: number | null;
  maxStorageGb: number | null;
  features: ReadonlySet<SaasFeature>;
};

export type PlanUsageSnapshot = {
  users: number;
  inspectionsThisMonth: number;
  storageUsedGb?: number;
};

export type PlanLimitCheck = {
  allowed: boolean;
  reason?: string;
};
