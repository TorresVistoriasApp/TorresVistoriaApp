import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { useAuth } from "@/app/auth-context";
import { useUser } from "@/app/user-context";
import type { Permission } from "@/lib/rbac";
import type { UserRole } from "@/lib/enums";
import {
  createPermissionChecker,
  type PermissionChecker,
} from "@/services/permission-service";

export type PermissionContextValue = PermissionChecker & {
  loading: boolean;
  /** Alias de `has` — compatibilidade com consumidores anteriores. */
  hasPermission: (permission: Permission) => boolean;
  /** Alias de `has` — API fluente da Etapa 9. */
  can: (permission: Permission) => boolean;
};

const PermissionContext = createContext<PermissionContextValue | undefined>(undefined);

export function PermissionProvider({ children }: { children: ReactNode }) {
  const { role, loading: userLoading } = useUser();
  const { isPlatformAdmin } = useAuth();

  const checker = useMemo(
    () => createPermissionChecker(isPlatformAdmin ? null : role),
    [role, isPlatformAdmin],
  );

  const value = useMemo<PermissionContextValue>(
    () => ({
      ...checker,
      loading: userLoading,
      hasPermission: checker.has,
      can: checker.has,
    }),
    [checker, userLoading],
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

/** Hook auxiliar quando só o papel importa. */
export function useRole(): UserRole | null {
  return usePermission().role;
}
