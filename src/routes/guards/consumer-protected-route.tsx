import { useEffect, useRef } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSession } from "@/core/auth/session-context";
import { usePrincipal } from "@/core/auth/use-principal";
import { consumerAuthService } from "@/core/auth/services/consumer-auth-service";
import { PrincipalType } from "@/core/rbac/roles";
import { LoadingSpinner } from "@/shared/components/loading-spinner";
import { ROUTES } from "@/config/routes";

/**
 * Porta de entrada da área do consumidor (B2C).
 * Exige sessão Supabase + identidade CUSTOMER resolvida no banco.
 */
export function ConsumerProtectedRoute() {
  const { session, loading: sessionLoading } = useSession();
  const { principalType, loading: principalLoading } = usePrincipal();
  const location = useLocation();
  const isSigningOut = useRef(false);

  const loading = sessionLoading || principalLoading;

  useEffect(() => {
    if (loading || !session || principalType === PrincipalType.CUSTOMER) return;
    if (isSigningOut.current) return;

    isSigningOut.current = true;
    void consumerAuthService.signOut().finally(() => {
      isSigningOut.current = false;
    });
  }, [loading, session, principalType]);

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <LoadingSpinner label="Carregando sua conta..." />
      </div>
    );
  }

  if (!session) {
    return <Navigate to={ROUTES.consultaLogin} state={{ from: location }} replace />;
  }

  if (principalType === PrincipalType.TENANT_MEMBER) {
    return <Navigate to={ROUTES.dashboard} replace />;
  }

  if (principalType === PrincipalType.PLATFORM_ADMIN) {
    return <Navigate to={ROUTES.adminCompanies} replace />;
  }

  if (principalType !== PrincipalType.CUSTOMER) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <LoadingSpinner label="Encerrando sessão inválida..." />
      </div>
    );
  }

  return <Outlet />;
}
