import {
  canViewInspection as rbacCanViewInspection,
  hasPermission,
  isInspector,
  isSuperAdmin,
  PERMISSIONS,
  type Permission,
} from "@/lib/rbac";
import {
  mergeCustomPermissions,
  type CustomPermissionGrant,
} from "@/lib/saas/plan-limit-service";
import type { UserRole } from "@/lib/enums";

export function resolvePermissionsForRole(role: UserRole | undefined): Permission[] {
  if (!role) return [];
  return (Object.keys(PERMISSIONS) as Permission[]).filter((permission) =>
    hasPermission(role, permission),
  );
}

export interface PermissionChecker {
  role: UserRole | null;
  permissions: ReadonlySet<Permission>;
  has: (permission: Permission) => boolean;
  hasAny: (...permissions: Permission[]) => boolean;
  hasRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
  isSuperAdmin: boolean;
  isInspector: boolean;
  canViewInspection: (inspectorId: string, userId: string | undefined) => boolean;
}

/** Instancia o verificador de permissões para um papel (fonte única de verdade). */
export function createPermissionChecker(role: UserRole | null | undefined): PermissionChecker {
  const resolvedRole = role ?? null;
  const permissions = new Set(resolvePermissionsForRole(resolvedRole ?? undefined));

  return {
    role: resolvedRole,
    permissions,
    has: (permission) => hasPermission(resolvedRole ?? undefined, permission),
    hasAny: (...permissionList) =>
      permissionList.some((permission) => hasPermission(resolvedRole ?? undefined, permission)),
    hasRole: (expectedRole) => resolvedRole === expectedRole,
    hasAnyRole: (roles) => !!resolvedRole && roles.includes(resolvedRole),
    isSuperAdmin: isSuperAdmin(resolvedRole ?? undefined),
    isInspector: isInspector(resolvedRole ?? undefined),
    canViewInspection: (inspectorId, userId) =>
      rbacCanViewInspection(resolvedRole ?? undefined, inspectorId, userId),
  };
}

/**
 * Extensão futura: checker com overrides de `company_custom_permissions`.
 * Quando implementado, carregar grants do banco e mesclar via `mergeCustomPermissions`.
 */
export function createPermissionCheckerWithGrants(
  role: UserRole | null | undefined,
  customGrants: CustomPermissionGrant[],
): PermissionChecker {
  const base = createPermissionChecker(role);
  if (customGrants.length === 0) {
    return base;
  }

  const merged = mergeCustomPermissions(base.permissions, customGrants);

  return {
    ...base,
    permissions: merged,
    has: (permission) => merged.has(permission),
    hasAny: (...permissionList) => permissionList.some((permission) => merged.has(permission)),
  };
}

/** API estável para uso fora de React (services, testes, scripts). */
export const PermissionService = {
  forRole: createPermissionChecker,
  resolvePermissionsForRole,
};
