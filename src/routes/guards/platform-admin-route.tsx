import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/core/auth/use-auth";
import { usePrincipal } from "@/core/auth/use-principal";
import { MfaChallengeScreen } from "@/core/auth/components/mfa-challenge-form";
import { LoadingSpinner } from "@/shared/components/loading-spinner";
import { PANEL_AUTH, homeForPrincipal } from "@/routes/panel";

/** Protege as rotas /admin/*: só contas cadastradas em `platform_admins` entram aqui. */
export function PlatformAdminRoute() {
  const { session, isPlatformAdmin, loading, mfaPending, completeMfa, signOut } = useAuth();
  const { principalType, loading: principalLoading } = usePrincipal();
  const location = useLocation();

  if (loading || (session && principalLoading)) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!session) {
    return <Navigate to={PANEL_AUTH.tenant} state={{ from: location }} replace />;
  }

  if (!isPlatformAdmin) {
    return <Navigate to={homeForPrincipal(principalType)} replace />;
  }

  if (mfaPending) {
    return <MfaChallengeScreen onVerify={completeMfa} onCancel={signOut} />;
  }

  return <Outlet />;
}
