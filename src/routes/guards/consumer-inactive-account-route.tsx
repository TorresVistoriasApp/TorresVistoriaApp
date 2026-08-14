import { Navigate, Outlet, useLocation } from "react-router-dom";
import { ROUTES } from "@/config/routes";
import { usePrincipal } from "@/core/auth/use-principal";
import { PrincipalType } from "@/core/rbac/roles";
import { ConsumerAccountStatus } from "@/core/auth/types";

/**
 * Contas em exclusão (pending_deletion) só podem acessar Minha conta para reativar.
 */
export function ConsumerInactiveAccountRoute() {
  const { resolution } = usePrincipal();
  const location = useLocation();

  const isInactive =
    resolution.status === "resolved" &&
    resolution.principalType === PrincipalType.CUSTOMER &&
    resolution.consumerProfile.account_status === ConsumerAccountStatus.PENDING_DELETION;

  const isProfileRoute = location.pathname === ROUTES.consultaAppMinhaConta;

  if (isInactive && !isProfileRoute) {
    return <Navigate to={ROUTES.consultaAppMinhaConta} replace />;
  }

  return <Outlet />;
}
