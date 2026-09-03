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
import { useSession } from "@/core/auth/session-context";
import { authService } from "@/core/auth/auth-service";
import { platformAdminService } from "@/core/auth/platform-admin-service";
import { isMfaChallengeRequired, hasVerifiedTotpFactor, isPrivilegedAccount, verifyMfaTotpCode } from "@/core/auth/mfa";
import { useAuthStore } from "@/core/auth/auth-store";
import { logger } from "@/core/observability/logger";
import { ROUTES } from "@/config/routes";
import type { PlatformAdmin, Profile } from "@/core/auth/types";

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  /** Preenchido só quando a conta é um operador da plataforma (fora de qualquer empresa). */
  platformAdmin: PlatformAdmin | null;
  isPlatformAdmin: boolean;
  /** Sessão + identidade (perfil / platform admin) resolvidos. */
  loading: boolean;
  /** Senha ok, mas AAL2 ainda pendente. */
  mfaPending: boolean;
  /** SUPER_ADMIN / platform admin sem TOTP verificado. */
  mfaEnrollmentRequired: boolean;
  signIn: (email: string, password: string, captchaToken?: string) => Promise<void>;
  completeMfa: (code: string) => Promise<void>;
  completeMfaEnrollment: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string, captchaToken?: string) => Promise<void>;
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
  const { session, user, loading: sessionLoading } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [platformAdmin, setPlatformAdmin] = useState<PlatformAdmin | null>(null);
  const [identityResolved, setIdentityResolved] = useState(false);
  const [mfaPending, setMfaPending] = useState(false);
  const [mfaEnrollmentRequired, setMfaEnrollmentRequired] = useState(false);
  const [mfaResolved, setMfaResolved] = useState(false);
  const loading =
    sessionLoading ||
    (!!session?.user.id && !identityResolved) ||
    (!!session?.user.id && !mfaResolved);

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
    }

    setProfile(null);
    setPlatformAdmin(null);
    setIdentityResolved(true);
  }, [session?.user.id]);

  useEffect(() => {
    if (!session?.user.id) {
      setMfaPending(false);
      setMfaEnrollmentRequired(false);
      setMfaResolved(true);
      return;
    }

    if (!identityResolved) {
      setMfaResolved(false);
      return;
    }

    let isActive = true;
    setMfaResolved(false);
    void (async () => {
      const challenge = await isMfaChallengeRequired().catch(() => false);
      if (!isActive) return;

      const privileged = isPrivilegedAccount(profile, !!platformAdmin);
      if (challenge) {
        setMfaPending(true);
        setMfaEnrollmentRequired(false);
        setMfaResolved(true);
        return;
      }

      setMfaPending(false);
      if (!privileged) {
        setMfaEnrollmentRequired(false);
        setMfaResolved(true);
        return;
      }

      const hasFactor = await hasVerifiedTotpFactor();
      if (!isActive) return;
      setMfaEnrollmentRequired(hasFactor === false);
      setMfaResolved(true);
    })();

    return () => {
      isActive = false;
    };
  }, [session?.user.id, session?.access_token, identityResolved, profile, platformAdmin]);

  useEffect(() => {
    if (!loading) {
      useAuthStore.getState().setInitialized(true);
    }
  }, [loading]);

  const signIn = useCallback(async (email: string, password: string, captchaToken?: string) => {
    await authService.signIn(email, password, captchaToken);
  }, []);

  const completeMfa = useCallback(async (code: string) => {
    await verifyMfaTotpCode(code);
    setMfaPending(false);
  }, []);

  const completeMfaEnrollment = useCallback(async () => {
    setMfaEnrollmentRequired(false);
    setMfaPending(false);
  }, []);

  const signOut = useCallback(async () => {
    await authService.signOut();
    setProfile(null);
    setPlatformAdmin(null);
    setMfaPending(false);
    setMfaEnrollmentRequired(false);
    setMfaResolved(true);
  }, []);

  const resetPassword = useCallback(async (email: string, captchaToken?: string) => {
    await authService.resetPassword(
      email,
      `${window.location.origin}${ROUTES.resetPassword}`,
      captchaToken,
    );
  }, []);

  const value = useMemo(
    () => ({
      session,
      user,
      profile,
      platformAdmin,
      isPlatformAdmin: !!platformAdmin,
      loading,
      mfaPending,
      mfaEnrollmentRequired,
      signIn,
      completeMfa,
      completeMfaEnrollment,
      signOut,
      resetPassword,
      refreshProfile,
    }),
    [
      session,
      user,
      profile,
      platformAdmin,
      loading,
      mfaPending,
      mfaEnrollmentRequired,
      signIn,
      completeMfa,
      completeMfaEnrollment,
      signOut,
      resetPassword,
      refreshProfile,
    ],
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
