import { Navigate, Outlet } from "react-router-dom";
import { ROUTES } from "@/config/routes";
import { usePrincipal } from "@/core/auth/use-principal";
import { useSession } from "@/core/auth/session-context";
import { PrincipalType } from "@/core/rbac/roles";
import { LoadingSpinner } from "@/shared/components/loading-spinner";

/** Área para vistoriador autenticado aguardando aprovação administrativa. */
export function InspectorPendingRoute() {
  const { session, loading: sessionLoading } = useSession();
  const { principalType, loading: principalLoading } = usePrincipal();

  if (sessionLoading || principalLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!session) {
    return <Navigate to={ROUTES.login} replace />;
  }

  if (principalType === PrincipalType.TENANT_MEMBER) {
    return <Navigate to={ROUTES.dashboard} replace />;
  }

  if (principalType !== PrincipalType.PENDING_INSPECTOR) {
    return <Navigate to={ROUTES.login} replace />;
  }

  return <Outlet />;
}
