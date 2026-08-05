import {
  canViewInspection as rbacCanViewInspection,
  hasPermission,
  isInspector,
  isSuperAdmin,
  PERMISSIONS,
  type Permission,
} from "@/lib/rbac";
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

/** API estável para uso fora de React (services, testes, scripts). */
export const PermissionService = {
  forRole: createPermissionChecker,
  resolvePermissionsForRole,
};
