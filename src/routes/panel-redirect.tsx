import { Navigate } from "react-router-dom";
import { ROUTES } from "@/config/routes";
import { usePrincipal } from "@/core/auth/use-principal";
import { useSession } from "@/core/auth/session-context";
import { LoadingSpinner } from "@/shared/components/loading-spinner";
import { consultaEntryForPrincipal, homeForPrincipal } from "@/routes/panel";

/**
 * Redireciona à casa do painel da identidade atual.
 *
 * Usado em entradas ambíguas (`/consulta`, URLs desconhecidas) para não mandar
 * um consumidor ao dashboard da empresa nem um vistoriador à landing pública.
 */
export function PanelRedirect({ entry = "home" }: { entry?: "home" | "consulta" }) {
  const { session, loading: sessionLoading } = useSession();
  const { principalType, loading: principalLoading } = usePrincipal();

  if (sessionLoading || (session && principalLoading)) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!session || !principalType) {
    return <Navigate to={ROUTES.consultaLanding} replace />;
  }

  const to = entry === "consulta" ? consultaEntryForPrincipal(principalType) : homeForPrincipal(principalType);
  return <Navigate to={to} replace />;
}
