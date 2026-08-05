import type { ReactNode } from "react";
import { usePermission } from "@/core/rbac/use-permission";
import type { Permission } from "@/core/rbac/permissions";

interface PermissionGuardProps {
  permission?: Permission;
  anyOf?: Permission[];
  children: ReactNode;
  fallback?: ReactNode;
}

/** Renderiza filhos apenas quando o usuário tem a permissão exigida. */
export function PermissionGuard({
  permission,
  anyOf,
  children,
  fallback = null,
}: PermissionGuardProps) {
  const { has, hasAny, loading } = usePermission();

  if (loading) return null;

  const allowed = permission ? has(permission) : anyOf ? hasAny(...anyOf) : false;

  if (!allowed) return <>{fallback}</>;

  return <>{children}</>;
}
