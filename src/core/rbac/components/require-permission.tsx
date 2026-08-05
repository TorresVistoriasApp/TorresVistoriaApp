import type { ReactNode } from "react";
import { PermissionGuard } from "@/core/rbac/components/permission-guard";
import type { Permission } from "@/core/rbac/permissions";
import { EmptyState } from "@/shared/components/empty-state";

export function RequirePermission({
  permission,
  children,
  fallback,
}: {
  permission: Permission;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <PermissionGuard
      permission={permission}
      fallback={
        fallback ?? (
          <EmptyState
            title="Acesso negado"
            description="Você não tem permissão para acessar este recurso."
          />
        )
      }
    >
      {children}
    </PermissionGuard>
  );
}

export function RequireAnyPermission({
  permissions,
  children,
  fallback,
}: {
  permissions: Permission[];
  children: ReactNode;
  fallback?: ReactNode;
}) {
  return (
    <PermissionGuard
      anyOf={permissions}
      fallback={
        fallback ?? (
          <EmptyState
            title="Acesso negado"
            description="Você não tem permissão para acessar este recurso."
          />
        )
      }
    >
      {children}
    </PermissionGuard>
  );
}