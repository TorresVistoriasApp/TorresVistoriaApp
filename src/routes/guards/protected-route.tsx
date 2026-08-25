import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useTenantBoot } from "@/core/tenant/use-tenant-boot";
import { usePrincipal } from "@/core/auth/use-principal";
import { PrincipalType } from "@/core/rbac/roles";
import { LoadingSpinner } from "@/shared/components/loading-spinner";
import { PANEL_AUTH, homeForPrincipal } from "@/routes/panel";

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
    return <Navigate to={PANEL_AUTH.tenant} state={{ from: location }} replace />;
  }

  if (principalType && principalType !== PrincipalType.TENANT_MEMBER) {
    return <Navigate to={homeForPrincipal(principalType)} replace />;
  }

  // Operador da plataforma não pertence a nenhuma empresa: nunca deve entrar
  // na área do tenant (que assume `profile` preenchido em toda a UI).
  if (isPlatformAdmin) {
    return <Navigate to={homeForPrincipal(PrincipalType.PLATFORM_ADMIN)} replace />;
  }

  return <Outlet />;
}
