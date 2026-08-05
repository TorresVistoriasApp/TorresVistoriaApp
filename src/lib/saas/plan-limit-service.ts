import type { Permission } from "@/lib/rbac";
import { getPlanLimits } from "@/lib/saas/plan-catalog";
import {
  SaasFeature,
  type PlanLimitCheck,
  type PlanUsageSnapshot,
} from "@/lib/saas/types";

function withinLimit(current: number, max: number | null): boolean {
  return max === null || current < max;
}

/** Verifica se o tenant pode adicionar mais usuários. */
export function canAddUser(
  planCode: string | null | undefined,
  usage: Pick<PlanUsageSnapshot, "users">,
): PlanLimitCheck {
  const limits = getPlanLimits(planCode);
  if (withinLimit(usage.users, limits.maxUsers)) {
    return { allowed: true };
  }
  return {
    allowed: false,
    reason: `Limite de ${limits.maxUsers} usuários atingido no plano ${limits.label}.`,
  };
}

/** Verifica se o tenant pode criar mais vistorias no mês corrente. */
export function canCreateInspection(
  planCode: string | null | undefined,
  usage: Pick<PlanUsageSnapshot, "inspectionsThisMonth">,
): PlanLimitCheck {
  const limits = getPlanLimits(planCode);
  if (withinLimit(usage.inspectionsThisMonth, limits.maxInspectionsPerMonth)) {
    return { allowed: true };
  }
  return {
    allowed: false,
    reason: `Limite mensal de ${limits.maxInspectionsPerMonth} vistorias atingido no plano ${limits.label}.`,
  };
}

/** Verifica feature flag do plano (filiais, API pública, marketplace, etc.). */
export function canUseFeature(
  planCode: string | null | undefined,
  feature: SaasFeature,
): PlanLimitCheck {
  const limits = getPlanLimits(planCode);
  if (limits.features.has(feature)) {
    return { allowed: true };
  }
  return {
    allowed: false,
    reason: `Recurso "${feature}" não disponível no plano ${limits.label}.`,
  };
}

export type CustomPermissionGrant = {
  permission: Permission;
  granted: boolean;
};

/**
 * Mescla permissões customizadas por usuário (tabela `company_custom_permissions`).
 * Reservado para RBAC granular — ainda não carregado do banco.
 */
export function mergeCustomPermissions(
  base: ReadonlySet<Permission>,
  grants: readonly CustomPermissionGrant[],
): ReadonlySet<Permission> {
  const merged = new Set(base);
  for (const grant of grants) {
    if (grant.granted) {
      merged.add(grant.permission);
    } else {
      merged.delete(grant.permission);
    }
  }
  return merged;
}
