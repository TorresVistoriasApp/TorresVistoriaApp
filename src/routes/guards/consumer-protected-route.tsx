import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSession } from "@/core/auth/session-context";
import { LoadingSpinner } from "@/shared/components/loading-spinner";
import { ROUTES } from "@/config/routes";

/**
 * Porta de entrada da área do consumidor (B2C).
 * Redireciona para o login do cliente quando não há sessão Supabase.
 */
export function ConsumerProtectedRoute() {
  const { session, loading } = useSession();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!session) {
    return <Navigate to={ROUTES.clienteLogin} state={{ from: location }} replace />;
  }

  return <Outlet />;
}
