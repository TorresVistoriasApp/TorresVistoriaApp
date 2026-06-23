import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { hasPermission, type Permission } from "@/lib/rbac";
import type { UserRole } from "@/lib/enums";
import { EmptyState } from "@/components/shared/empty-state";

export function RequirePermission({
  permission,
  children,
  fallback,
}: {
  permission: Permission;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { profile } = useAuth();
  if (!hasPermission(profile?.role, permission)) {
    return (
      fallback ?? (
        <EmptyState
          title="Acesso negado"
          description="Você não tem permissão para acessar este recurso."
        />
      )
    );
  }
  return <>{children}</>;
}

export function RequireRole({
  roles,
  children,
}: {
  roles: UserRole[];
  children: ReactNode;
}) {
  const { profile } = useAuth();
  if (!profile?.role || !roles.includes(profile.role)) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}
