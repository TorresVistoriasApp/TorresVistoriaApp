import { Navigate, useSearchParams } from "react-router-dom";

export function Page() {
  const [params] = useSearchParams();
  const tab = params.get("tab") ?? "perfil";
  return <Navigate to={`/configuracoes?tab=${tab}`} replace />;
}
