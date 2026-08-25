import { Navigate, Outlet } from "react-router-dom";
import { usePrincipal } from "@/core/auth/use-principal";
import { useSession } from "@/core/auth/session-context";
import { PrincipalType } from "@/core/rbac/roles";
import { LoadingSpinner } from "@/shared/components/loading-spinner";
import { PANEL_AUTH, homeForPrincipal } from "@/routes/panel";

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
    return <Navigate to={PANEL_AUTH.tenant} replace />;
  }

  if (principalType === PrincipalType.PENDING_INSPECTOR) {
    return <Outlet />;
  }

  return <Navigate to={homeForPrincipal(principalType)} replace />;
}
