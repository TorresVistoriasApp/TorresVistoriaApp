import { useMemo } from "react";
import { useTenantContext } from "@/core/tenant";
import { getPlanLimits, planHasFeature } from "@/core/subscription/plan-catalog";
import { canAddUser, canCreateInspection, canUseFeature } from "@/core/subscription/plan-limit-service";
import type { PlanUsageSnapshot, SaasFeature } from "@/core/subscription/types";

/**
 * Limites e features do plano SaaS do tenant atual.
 * Uso opcional em UI/guards — enforcement definitivo ficará no backend.
 */
export function usePlanLimits(usage?: Partial<PlanUsageSnapshot>) {
  const { plan } = useTenantContext();
  const limits = useMemo(() => getPlanLimits(plan), [plan]);

  const snapshot: PlanUsageSnapshot = {
    users: usage?.users ?? 0,
    inspectionsThisMonth: usage?.inspectionsThisMonth ?? 0,
    storageUsedGb: usage?.storageUsedGb,
  };

  return {
    plan: limits.plan,
    planLabel: limits.label,
    limits,
    hasFeature: (feature: SaasFeature) => planHasFeature(plan, feature),
    canUseFeature: (feature: SaasFeature) => canUseFeature(plan, feature),
    canAddUser: () => canAddUser(plan, snapshot),
    canCreateInspection: () => canCreateInspection(plan, snapshot),
  };
}
