import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useTenantBoot } from "@/core/tenant/use-tenant-boot";
import { usePrincipal } from "@/core/auth/use-principal";
import { PrincipalType } from "@/core/rbac/roles";
import { LoadingSpinner } from "@/shared/components/loading-spinner";
import { ROUTES } from "@/config/routes";

/**
 * Porta de entrada da área do tenant: garante sessão válida.
 *
 * Deliberadamente não decide permissão de tela — isso é responsabilidade do
 * manifesto de rotas de cada módulo, via `RouteAccess`.
 */
export function ProtectedRoute() {
  const { session, isPlatformAdmin, loading: tenantBootLoading } = useTenantBoot();
  const { principalType, loading: principalLoading } = usePrincipal();
  const location = useLocation();

  const loading = tenantBootLoading || (session && principalLoading);

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!session) {
    return <Navigate to={ROUTES.login} state={{ from: location }} replace />;
  }

  if (principalType === PrincipalType.CUSTOMER) {
    return <Navigate to={ROUTES.consultaApp} replace />;
  }

  if (principalType === PrincipalType.PENDING_INSPECTOR) {
    return <Navigate to={ROUTES.vistoriaPendingApproval} replace />;
  }

  // Operador da plataforma não pertence a nenhuma empresa: nunca deve entrar
  // na área do tenant (que assume `profile` preenchido em toda a UI).
  if (isPlatformAdmin) {
    return <Navigate to={ROUTES.adminCompanies} replace />;
  }

  return <Outlet />;
}
