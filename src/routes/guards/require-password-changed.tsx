import { type ReactNode } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/core/auth/use-auth";
import { LoadingSpinner } from "@/shared/components/loading-spinner";
import { ROUTES } from "@/config/routes";

export function RequirePasswordChanged({ children }: { children?: ReactNode }) {
  const { profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (profile?.must_change_password && location.pathname !== ROUTES.changePassword) {
    return <Navigate to={ROUTES.changePassword} replace />;
  }

  return children ?? <Outlet />;
}
