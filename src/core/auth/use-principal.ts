import { useEffect, useState } from "react";
import { useSession } from "@/core/auth/session-context";
import {
  getPrincipalType,
  resolvePrincipal,
  type PrincipalResolution,
} from "@/core/auth/principal-resolver";
import { PrincipalType } from "@/core/rbac/roles";

export function usePrincipal() {
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
    }, 10_000);

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

  const principalType = getPrincipalType(resolution);

  return {
    resolution,
    principalType,
    loading: sessionLoading || identityLoading,
    isPlatformAdmin: principalType === PrincipalType.PLATFORM_ADMIN,
    isTenantMember: principalType === PrincipalType.TENANT_MEMBER,
    isCustomer: principalType === PrincipalType.CUSTOMER,
  };
}
