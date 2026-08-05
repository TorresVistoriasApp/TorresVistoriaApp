export {
  SubscriptionPlan,
  CompanyTenantStatus,
  SaasFeature,
  type PlanLimits,
  type PlanUsageSnapshot,
  type PlanLimitCheck,
} from "@/lib/saas/types";

export {
  PLAN_CATALOG,
  getPlanLimits,
  isSubscriptionPlan,
  planHasFeature,
  resolveSubscriptionPlan,
} from "@/lib/saas/plan-catalog";

export {
  canAddUser,
  canCreateInspection,
  canUseFeature,
  mergeCustomPermissions,
  type CustomPermissionGrant,
} from "@/lib/saas/plan-limit-service";

export {
  IntegrationProvider,
  IntegrationStatus,
  type IntegrationConnection,
  type TenantInvitation,
  type CompanyBranch,
  type CompanyTeam,
  type CompanySubscription,
} from "@/lib/saas/integration-types";
