import type { ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import type { UserRole } from "@/lib/enums";

interface RoleGuardProps {
  children: ReactNode;
  allowedRoles: UserRole[];
  fallback?: ReactNode;
}

export function RoleGuard({ children, allowedRoles, fallback = null }: RoleGuardProps) {
  const { profile } = useAuth();

  if (!profile?.role || !allowedRoles.includes(profile.role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
