import { Navigate, Outlet, useLocation } from "react-router-dom";
import { usePrincipal } from "@/core/auth/use-principal";
import { useSession } from "@/core/auth/session-context";
import { LoadingSpinner } from "@/shared/components/loading-spinner";
import { resolvePostAuthPath } from "@/routes/panel";

/**
 * Guarda rotas públicas de auth do consumidor (login, cadastro).
 * Redireciona usuários já autenticados à área correta do ecossistema.
 */
export function ConsumerAuthRoute() {
  const { session, loading: sessionLoading } = useSession();
  const { principalType, loading: principalLoading } = usePrincipal();
  const location = useLocation();

  if (sessionLoading || (session && principalLoading)) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (session && principalType) {
    const from = (location.state as { from?: { pathname: string; search?: string } } | null)?.from;
    return <Navigate to={resolvePostAuthPath(principalType, from)} replace />;
  }

  return <Outlet />;
}
