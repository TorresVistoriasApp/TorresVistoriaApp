import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/features/auth/context/auth-context";
import { LoadingScreen } from "@/shared/components/ui/loading-screen";

export function ProtectedRoute() {
  const { session, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
