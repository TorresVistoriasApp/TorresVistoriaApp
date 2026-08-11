import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSession } from "@/core/auth/session-context";
import { usePrincipal } from "@/core/auth/use-principal";
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

  const loading = sessionLoading || (session && principalLoading);

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <LoadingSpinner />
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
    return <Navigate to={ROUTES.consultaLogin} state={{ from: location }} replace />;
  }

  return <Outlet />;
}
