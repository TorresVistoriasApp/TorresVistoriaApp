import { Navigate, useSearchParams } from "react-router-dom";
import { ROUTES } from "@/lib/constants";

export function Page() {
  const [params] = useSearchParams();
  const tab = params.get("tab") ?? "perfil";
  return <Navigate to={`${ROUTES.settings}?tab=${tab}`} replace />;
}
