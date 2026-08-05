import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { useAuth } from "@/app/auth-context";
import { useUser } from "@/app/user-context";
import { hasPermission as checkPermission, type Permission } from "@/lib/rbac";
import type { UserRole } from "@/lib/enums";
import { resolvePermissionsForRole } from "@/services/permission-service";

interface PermissionContextValue {
  role: UserRole | null;
  permissions: ReadonlySet<Permission>;
  loading: boolean;
  hasPermission: (permission: Permission) => boolean;
}

const PermissionContext = createContext<PermissionContextValue | undefined>(undefined);

export function PermissionProvider({ children }: { children: ReactNode }) {
  const { role, loading: userLoading } = useUser();
  const { isPlatformAdmin } = useAuth();

  const permissions = useMemo(() => {
    if (isPlatformAdmin || !role) {
      return new Set<Permission>();
    }
    return new Set(resolvePermissionsForRole(role));
  }, [role, isPlatformAdmin]);

  const value = useMemo(
    () => ({
      role,
      permissions,
      loading: userLoading,
      hasPermission: (permission: Permission) => checkPermission(role ?? undefined, permission),
    }),
    [role, permissions, userLoading],
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
