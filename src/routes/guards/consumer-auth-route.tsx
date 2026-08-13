import { Navigate, Outlet } from "react-router-dom";
import { ROUTES } from "@/config/routes";
import { usePrincipal } from "@/core/auth/use-principal";
import { useSession } from "@/core/auth/session-context";
import { consumerAuthService } from "@/core/auth/services/consumer-auth-service";
import { PrincipalType } from "@/core/rbac/roles";
import { LoadingSpinner } from "@/shared/components/loading-spinner";
import { useEffect, useRef } from "react";

/**
 * Guarda rotas públicas de auth do consumidor (login, cadastro).
 * Redireciona usuários já autenticados à área correta do ecossistema.
 */
export function ConsumerAuthRoute() {
  const { session, loading: sessionLoading } = useSession();
  const { principalType, resolution, loading: principalLoading } = usePrincipal();
  const clearedUnknownSession = useRef(false);

  // Sessão órfã (token válido sem perfil conhecido) bloqueava o login em loading infinito.
  useEffect(() => {
    if (sessionLoading || principalLoading || !session) return;
    if (resolution.status !== "unknown" || clearedUnknownSession.current) return;

    clearedUnknownSession.current = true;
    void consumerAuthService.signOut();
  }, [session, sessionLoading, principalLoading, resolution.status]);

  if (sessionLoading || (session && principalLoading)) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (session && principalType === PrincipalType.CUSTOMER) {
    return <Navigate to={ROUTES.consultaApp} replace />;
  }

  if (session && principalType === PrincipalType.TENANT_MEMBER) {
    return <Navigate to={ROUTES.dashboard} replace />;
  }

  if (session && principalType === PrincipalType.PLATFORM_ADMIN) {
    return <Navigate to={ROUTES.adminCompanies} replace />;
  }

  if (session && principalType === PrincipalType.PENDING_INSPECTOR) {
    return <Navigate to={ROUTES.vistoriaPendingApproval} replace />;
  }

  return <Outlet />;
}
