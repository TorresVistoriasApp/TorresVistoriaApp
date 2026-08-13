import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/core/auth/auth-context";
import { useUser } from "@/core/auth/user-context";
import { useTenantContext } from "@/core/tenant/tenant-context";
import { resolveTenant } from "@/core/tenant/tenant-resolver";
import { LoadingSpinner } from "@/shared/components/loading-spinner";
import { Button } from "@/shared/ui/button";
import { ROUTES } from "@/config/routes";

/**
 * Garante que existe um tenant resolvido antes de renderizar a área da empresa.
 *
 * Complementa o `ProtectedRoute`, que só valida sessão: um usuário pode estar
 * autenticado e ainda assim não ter tenant utilizável — perfil sem `tenant_id`,
 * ou falha ao carregar os dados da empresa. Antes deste guard esses dois casos
 * caíam na UI do tenant, que assume `company` preenchido, e o resultado era tela
 * quebrada em vez de erro explicável.
 */
export function TenantGuard() {
  const { session, isPlatformAdmin, loading: authLoading, signOut, refreshProfile } = useAuth();
  const { tenantId } = useUser();
  const { company, loading, error, refreshTenant } = useTenantContext();
  const location = useLocation();

  const resolution = resolveTenant({
    hasSession: Boolean(session),
    isPlatformAdmin,
    sessionTenantId: tenantId,
  });

  if (authLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (resolution.status === "anonymous") {
    return <Navigate to={ROUTES.login} state={{ from: location }} replace />;
  }

  if (resolution.status === "platform-admin") {
    return <Navigate to={ROUTES.adminCompanies} replace />;
  }

  if (resolution.status === "missing-tenant") {
    return (
      <TenantUnavailable
        title="Conta sem empresa vinculada"
        description="Seu usuário não está associado a nenhuma empresa. Peça a um administrador para revisar seu cadastro."
        onRetry={refreshProfile}
        onSignOut={signOut}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !company) {
    return (
      <TenantUnavailable
        title="Não foi possível carregar a empresa"
        description={error ?? "Os dados da empresa não retornaram. Tente novamente."}
        onRetry={refreshTenant}
        onSignOut={signOut}
      />
    );
  }

  return <Outlet />;
}

function TenantUnavailable({
  title,
  description,
  onRetry,
  onSignOut,
}: {
  title: string;
  description: string;
  onRetry?: () => void | Promise<void>;
  onSignOut?: () => void | Promise<void>;
}) {
  return (
    <div className="flex min-h-dvh items-center justify-center p-6">
      <div className="surface w-full max-w-md space-y-4 p-8 text-center">
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
        {onRetry ? (
          <Button onClick={() => void onRetry()} className="w-full">
            Tentar novamente
          </Button>
        ) : null}
        {onSignOut ? (
          <Button variant="outline" onClick={() => void onSignOut()} className="w-full">
            Sair
          </Button>
        ) : null}
      </div>
    </div>
  );
}
