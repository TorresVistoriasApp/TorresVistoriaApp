import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/core/auth/use-auth";
import { LoadingSpinner } from "@/shared/components/loading-spinner";
import { ROUTES } from "@/config/routes";

/** Protege as rotas /admin/*: só contas cadastradas em `platform_admins` entram aqui. */
export function PlatformAdminRoute() {
  const { session, isPlatformAdmin, loading } = useAuth();
  const location = useLocation();

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

  if (!isPlatformAdmin) {
    return <Navigate to={ROUTES.dashboard} replace />;
  }

  return <Outlet />;
}
