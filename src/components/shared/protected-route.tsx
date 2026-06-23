import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import type { UserRole } from "@/lib/enums";

interface ProtectedRouteProps {
  requiredRole?: UserRole;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ requiredRole, fallback }: ProtectedRouteProps = {}) {
  const { session, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && profile?.role !== requiredRole) {
    if (fallback) return <>{fallback}</>;
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
