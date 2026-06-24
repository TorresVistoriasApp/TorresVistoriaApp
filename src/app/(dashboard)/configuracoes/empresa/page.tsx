import { Navigate } from "react-router-dom";

export function Page() {
  return <Navigate to="/configuracoes?tab=empresa" replace />;
}
