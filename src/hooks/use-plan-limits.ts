import { useMemo } from "react";
import { useCompanyContext } from "@/app/company-context";
import { getPlanLimits, planHasFeature } from "@/lib/saas/plan-catalog";
import { canAddUser, canCreateInspection, canUseFeature } from "@/lib/saas/plan-limit-service";
import type { PlanUsageSnapshot, SaasFeature } from "@/lib/saas/types";

/**
 * Limites e features do plano SaaS do tenant atual.
 * Uso opcional em UI/guards — enforcement definitivo ficará no backend.
 */
export function usePlanLimits(usage?: Partial<PlanUsageSnapshot>) {
  const { plan } = useCompanyContext();
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
