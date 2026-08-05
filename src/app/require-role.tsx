import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { PermissionGuard } from "@/components/shared/permission-guard";
import { RoleGuard } from "@/components/shared/role-guard";
import type { Permission } from "@/lib/rbac";
import type { UserRole } from "@/lib/enums";
import { EmptyState } from "@/components/shared/empty-state";
import { ROUTES } from "@/lib/constants";

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

export function RequireRole({
  roles,
  children,
}: {
  roles: UserRole[];
  children: ReactNode;
}) {
  return (
    <RoleGuard allowedRoles={roles} fallback={<Navigate to={ROUTES.dashboard} replace />}>
      {children}
    </RoleGuard>
  );
}
