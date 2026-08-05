import { Navigate } from "react-router-dom";
import { ROUTES } from "@/config/routes";

export function ProfileSettingsPage() {
  return <Navigate to={ROUTES.settings} replace />;
}
