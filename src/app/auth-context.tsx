import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { db } from "@/lib/db-client";
import { authService } from "@/services/auth-service";
import { platformAdminService } from "@/services/platform-admin-service";
import { useAuthStore } from "@/stores/auth-store";
import { clearSignedUrlCache } from "@/lib/storage-url";
import { offlineStore } from "@/features/draft/lib/offline-store";
import { queryClient } from "@/lib/query-client";
import { logger } from "@/lib/logger";
import { ROUTES } from "@/lib/constants";
import type { PlatformAdmin, Profile } from "@/types";

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  /** Preenchido só quando a conta é um operador da plataforma (fora de qualquer empresa). */
  platformAdmin: PlatformAdmin | null;
  isPlatformAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

type FetchResult<T> = { status: "ok"; data: T | null } | { status: "error" };

async function fetchProfile(userId: string): Promise<FetchResult<Profile>> {
  try {
    return { status: "ok", data: await authService.getProfile(userId) };
  } catch (error) {
    logger.error("Erro ao carregar perfil", error instanceof Error ? error.message : error);
    return { status: "error" };
  }
}

async function fetchPlatformAdmin(userId: string): Promise<FetchResult<PlatformAdmin>> {
  try {
    return { status: "ok", data: await platformAdminService.getSelf(userId) };
  } catch (error) {
    logger.error(
      "Erro ao carregar operador da plataforma",
      error instanceof Error ? error.message : error,
    );
    return { status: "error" };
  }
}

function applyResult<T>(result: FetchResult<T>, apply: (data: T | null) => void) {
  if (result.status === "ok") {
    apply(result.data);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [platformAdmin, setPlatformAdmin] = useState<PlatformAdmin | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [identityResolved, setIdentityResolved] = useState(false);
  const loading = authLoading || (!!session?.user.id && !identityResolved);

  const refreshProfile = useCallback(async () => {
    if (!session?.user.id) {
      setProfile(null);
      setPlatformAdmin(null);
      return;
    }
    const [profileResult, platformAdminResult] = await Promise.all([
      fetchProfile(session.user.id),
      fetchPlatformAdmin(session.user.id),
    ]);
    applyResult(profileResult, setProfile);
    applyResult(platformAdminResult, setPlatformAdmin);
  }, [session?.user.id]);

  useEffect(() => {
    let isMounted = true;

    db.auth.getSession().then(({ data }) => {
      if (!isMounted) return;
      setSession(data.session);
      setAuthLoading(false);
    });

    const { data: { subscription } } = db.auth.onAuthStateChange((_event, nextSession) => {
      setSession((currentSession) => {
        const currentUserId = currentSession?.user.id;
        const nextUserId = nextSession?.user.id;

        if (currentUserId !== nextUserId) {
          setProfile(null);
          setPlatformAdmin(null);
          setIdentityResolved(false);
        }

        return nextSession;
      });
      setAuthLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (session?.user.id) {
      let isActive = true;
      setIdentityResolved(false);
      void Promise.all([fetchProfile(session.user.id), fetchPlatformAdmin(session.user.id)])
        .then(([profileResult, platformAdminResult]) => {
          if (!isActive) return;
          applyResult(profileResult, setProfile);
          applyResult(platformAdminResult, setPlatformAdmin);
        })
        .finally(() => {
          if (isActive) setIdentityResolved(true);
        });

      return () => {
        isActive = false;
      };
    } else {
      setProfile(null);
      setPlatformAdmin(null);
      setIdentityResolved(true);
    }
  }, [session?.user.id]);

  useEffect(() => {
    if (!loading) {
      useAuthStore.getState().setInitialized(true);
    }
  }, [loading]);

  const signIn = useCallback(async (email: string, password: string) => {
    await authService.signIn(email, password);
  }, []);

  const signOut = useCallback(async () => {
    await authService.signOut();
    clearSignedUrlCache();
    await offlineStore.clearAll();
    queryClient.clear();
    setProfile(null);
    setPlatformAdmin(null);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    await authService.resetPassword(email, `${window.location.origin}${ROUTES.resetPassword}`);
  }, []);

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      platformAdmin,
      isPlatformAdmin: !!platformAdmin,
      loading,
      signIn,
      signOut,
      resetPassword,
      refreshProfile,
    }),
    [session, profile, platformAdmin, loading, signIn, signOut, resetPassword, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }
  return context;
}

export const useAuth = useAuthContext;
