import { Navigate } from "react-router-dom";
import { ROUTES } from "@/lib/constants";

export function Page() {
  return <Navigate to={ROUTES.settings} replace />;
}
