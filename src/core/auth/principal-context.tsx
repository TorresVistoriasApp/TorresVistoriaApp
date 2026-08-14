import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useSession } from "@/core/auth/session-context";
import {
  getPrincipalType,
  resolvePrincipal,
  type PrincipalResolution,
} from "@/core/auth/principal-resolver";
import { PrincipalType } from "@/core/rbac/roles";

const PRINCIPAL_RESOLVE_TIMEOUT_MS = 8_000;

interface PrincipalContextValue {
  resolution: PrincipalResolution;
  principalType: ReturnType<typeof getPrincipalType>;
  loading: boolean;
  isPlatformAdmin: boolean;
  isTenantMember: boolean;
  isCustomer: boolean;
  refreshIdentity: () => Promise<void>;
}

const PrincipalContext = createContext<PrincipalContextValue | undefined>(undefined);

/**
 * Resolve identidade uma única vez por sessão — evita loops entre guards de auth
 * e área protegida que antes chamavam resolvePrincipal em paralelo.
 */
export function PrincipalProvider({ children }: { children: ReactNode }) {
  const { session, loading: sessionLoading } = useSession();
  const [resolution, setResolution] = useState<PrincipalResolution>({ status: "anonymous" });
  const [identityLoading, setIdentityLoading] = useState(false);

  useEffect(() => {
    if (sessionLoading) return;

    if (!session?.user.id) {
      setResolution({ status: "anonymous" });
      setIdentityLoading(false);
      return;
    }

    let isActive = true;
    setIdentityLoading(true);

    const timeoutId = window.setTimeout(() => {
      if (!isActive) return;
      setResolution({ status: "unknown" });
      setIdentityLoading(false);
    }, PRINCIPAL_RESOLVE_TIMEOUT_MS);

    void resolvePrincipal(session.user.id)
      .then((result) => {
        if (isActive) setResolution(result);
      })
      .catch(() => {
        if (isActive) setResolution({ status: "unknown" });
      })
      .finally(() => {
        window.clearTimeout(timeoutId);
        if (isActive) setIdentityLoading(false);
      });

    return () => {
      isActive = false;
      window.clearTimeout(timeoutId);
    };
  }, [session?.user.id, sessionLoading]);

  const refreshIdentity = useCallback(async () => {
    if (!session?.user.id) {
      setResolution({ status: "anonymous" });
      return;
    }
    const result = await resolvePrincipal(session.user.id);
    setResolution(result);
  }, [session?.user.id]);

  const principalType = getPrincipalType(resolution);
  const loading = sessionLoading || identityLoading;

  const value = useMemo(
    () => ({
      resolution,
      principalType,
      loading,
      isPlatformAdmin: principalType === PrincipalType.PLATFORM_ADMIN,
      isTenantMember: principalType === PrincipalType.TENANT_MEMBER,
      isCustomer: principalType === PrincipalType.CUSTOMER,
      refreshIdentity,
    }),
    [resolution, principalType, loading, refreshIdentity],
  );

  return <PrincipalContext.Provider value={value}>{children}</PrincipalContext.Provider>;
}

export function usePrincipal(): PrincipalContextValue {
  const context = useContext(PrincipalContext);
  if (!context) {
    throw new Error("usePrincipal deve ser usado dentro de PrincipalProvider");
  }
  return context;
}
