import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useTenantBoot } from "@/hooks/use-tenant-boot";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { ROUTES } from "@/lib/constants";
import type { UserRole } from "@/lib/enums";

interface ProtectedRouteProps {
  requiredRole?: UserRole;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ requiredRole, fallback }: ProtectedRouteProps = {}) {
  const { session, profile, isPlatformAdmin, loading } = useTenantBoot();
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

  // Operador da plataforma não pertence a nenhuma empresa: nunca deve entrar
  // na área do tenant (que assume `profile` preenchido em toda a UI).
  if (isPlatformAdmin) {
    return <Navigate to={ROUTES.adminCompanies} replace />;
  }

  if (requiredRole && profile?.role !== requiredRole) {
    if (fallback) return <>{fallback}</>;
    return <Navigate to={ROUTES.dashboard} replace />;
  }

  return <Outlet />;
}
