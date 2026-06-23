import { Navigate } from "react-router-dom";
import { ROUTES } from "@/lib/constants";

/** Root redirect — autenticado vai para dashboard via ProtectedRoute */
export function Page() {
  return <Navigate to={ROUTES.dashboard} replace />;
}
