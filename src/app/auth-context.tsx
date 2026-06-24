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
import { useAuthStore } from "@/stores/auth-store";
import { ROUTES } from "@/lib/constants";
import type { Profile } from "@/types";

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function fetchProfile(userId: string): Promise<Profile | null> {
  try {
    return await authService.getProfile(userId);
  } catch (error) {
    console.error("Erro ao carregar perfil:", error instanceof Error ? error.message : error);
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const loading = authLoading || profileLoading;

  const refreshProfile = useCallback(async () => {
    if (!session?.user.id) {
      setProfile(null);
      return;
    }
    setProfileLoading(true);
    try {
      setProfile(await fetchProfile(session.user.id));
    } finally {
      setProfileLoading(false);
    }
  }, [session?.user.id]);

  useEffect(() => {
    let isMounted = true;

    db.auth.getSession().then(({ data }) => {
      if (!isMounted) return;
      setProfileLoading(!!data.session?.user.id);
      setSession(data.session);
      setAuthLoading(false);
    });

    const { data: { subscription } } = db.auth.onAuthStateChange((_event, nextSession) => {
      setSession((currentSession) => {
        const currentUserId = currentSession?.user.id;
        const nextUserId = nextSession?.user.id;

        if (currentUserId !== nextUserId) {
          setProfile(null);
          setProfileLoading(!!nextUserId);
        } else {
          setProfileLoading(false);
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
      setProfileLoading(true);
      void fetchProfile(session.user.id)
        .then((nextProfile) => {
          if (isActive) setProfile(nextProfile);
        })
        .finally(() => {
          if (isActive) setProfileLoading(false);
        });

      return () => {
        isActive = false;
      };
    } else {
      setProfile(null);
      setProfileLoading(false);
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
    setProfile(null);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    await authService.resetPassword(email, `${window.location.origin}${ROUTES.resetPassword}`);
  }, []);

  const value = useMemo(
    () => ({ session, user: session?.user ?? null, profile, loading, signIn, signOut, resetPassword, refreshProfile }),
    [session, profile, loading, signIn, signOut, resetPassword, refreshProfile],
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
