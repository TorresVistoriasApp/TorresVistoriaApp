import type { ReactNode } from "react";
import { usePermission } from "@/hooks/use-permission";
import type { UserRole } from "@/lib/enums";

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  fallback?: ReactNode;
}

/** Renderiza filhos apenas quando o usuário tem um dos papéis permitidos. */
export function RoleGuard({ children, allowedRoles, fallback = null }: RoleGuardProps) {
  const { hasAnyRole, loading } = usePermission();

  if (loading) return null;

  if (!hasAnyRole(allowedRoles)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
