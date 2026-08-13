import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import { useAuth } from "@/core/auth/auth-context";
import type { UserRole } from "@/core/rbac/roles";
import { createPermissionChecker } from "@/core/rbac/permission-service";
import { tenantIdFromAppMetadata } from "@/core/tenant/tenant-resolver";
import type { Profile } from "@/core/auth/types";

export interface UserContextValue {
  user: User | null;
  profile: Profile | null;
  userId: string | null;
  tenantId: string | null;
  role: UserRole | null;
  fullName: string | null;
  email: string | null;
  avatarUrl: string | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  isSuperAdmin: boolean;
  isInspector: boolean;
}

const UserContext = createContext<UserContextValue | undefined>(undefined);

/** Perfil do usuário logado (tenant) — separado das ações de autenticação. */
export function UserProvider({ children }: { children: ReactNode }) {
  const { user, profile, loading, refreshProfile } = useAuth();

  const value = useMemo<UserContextValue>(() => {
    const checker = createPermissionChecker(profile?.role);
    return {
      user,
      profile,
      userId: profile?.id ?? user?.id ?? null,
      tenantId: profile?.tenant_id ?? tenantIdFromAppMetadata(user?.app_metadata) ?? null,
      role: profile?.role ?? null,
      fullName: profile?.full_name ?? null,
      email: profile?.email ?? user?.email ?? null,
      avatarUrl: profile?.avatar_url ?? null,
      loading,
      refreshProfile,
      isSuperAdmin: checker.isSuperAdmin,
      isInspector: checker.isInspector,
    };
  }, [user, profile, loading, refreshProfile]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUserContext() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser deve ser usado dentro de UserProvider");
  }
  return context;
}

export const useUser = useUserContext;
