import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { useAuth } from "@/app/auth-context";
import { hasPermission, type Permission } from "@/lib/rbac";
import { resolvePermissionsForRole } from "@/services/permission-service";

interface PermissionContextValue {
  permissions: ReadonlySet<Permission>;
  loading: boolean;
  hasPermission: (permission: Permission) => boolean;
}

const PermissionContext = createContext<PermissionContextValue | undefined>(undefined);

export function PermissionProvider({ children }: { children: ReactNode }) {
  const { profile, isPlatformAdmin, loading: authLoading } = useAuth();

  const permissions = useMemo(() => {
    if (isPlatformAdmin || !profile?.role) {
      return new Set<Permission>();
    }
    return new Set(resolvePermissionsForRole(profile.role));
  }, [profile?.role, isPlatformAdmin]);

  const value = useMemo(
    () => ({
      permissions,
      loading: authLoading,
      hasPermission: (permission: Permission) => hasPermission(profile?.role, permission),
    }),
    [permissions, authLoading, profile?.role],
  );

  return <PermissionContext.Provider value={value}>{children}</PermissionContext.Provider>;
}

export function usePermissionContext() {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error("usePermission deve ser usado dentro de PermissionProvider");
  }
  return context;
}

export const usePermission = usePermissionContext;
