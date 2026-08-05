import { hasPermission, PERMISSIONS, type Permission } from "@/lib/rbac";
import type { UserRole } from "@/lib/enums";

/** Resolve permissões efetivas do papel (fase 1: mapa estático; Etapa 9 pode consultar o banco). */
export function resolvePermissionsForRole(role: UserRole | undefined): Permission[] {
  if (!role) return [];
  return (Object.keys(PERMISSIONS) as Permission[]).filter((permission) =>
    hasPermission(role, permission),
  );
}

export function permissionService() {
  return {
    resolveForRole: resolvePermissionsForRole,
    has: hasPermission,
  };
}
