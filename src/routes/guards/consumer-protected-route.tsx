import { useEffect, useRef } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSession } from "@/core/auth/session-context";
import { useAuth } from "@/core/auth/use-auth";
import { usePrincipal } from "@/core/auth/use-principal";
import { consumerAuthService } from "@/core/auth/services/consumer-auth-service";
import { PrincipalType } from "@/core/rbac/roles";
import { MfaChallengeScreen } from "@/core/auth/components/mfa-challenge-form";
import { LoadingSpinner } from "@/shared/components/loading-spinner";
import { PANEL_AUTH, homeForPrincipal } from "@/routes/panel";

/**
 * Porta de entrada da área do consumidor (B2C).
 * Exige sessão Supabase + identidade CUSTOMER resolvida no banco.
 */
export function ConsumerProtectedRoute() {
  const { session, loading: sessionLoading } = useSession();
  const { mfaPending, completeMfa, signOut, loading: authLoading } = useAuth();
  const { principalType, loading: principalLoading } = usePrincipal();
  const location = useLocation();
  const isSigningOut = useRef(false);

  const loading = sessionLoading || principalLoading || authLoading;
  const isForeignPrincipal =
    principalType === PrincipalType.TENANT_MEMBER ||
    principalType === PrincipalType.PLATFORM_ADMIN ||
    principalType === PrincipalType.PENDING_INSPECTOR;

  useEffect(() => {
    if (loading || !session || principalType === PrincipalType.CUSTOMER || isForeignPrincipal) {
      return;
    }
    if (isSigningOut.current) return;

    isSigningOut.current = true;
    void consumerAuthService.signOut().finally(() => {
      isSigningOut.current = false;
    });
  }, [loading, session, principalType, isForeignPrincipal]);

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <LoadingSpinner label="Carregando sua conta..." />
      </div>
    );
  }

  if (!session) {
    return <Navigate to={PANEL_AUTH.consumer} state={{ from: location }} replace />;
  }

  if (isForeignPrincipal && principalType) {
    return <Navigate to={homeForPrincipal(principalType)} replace />;
  }

  if (principalType !== PrincipalType.CUSTOMER) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <LoadingSpinner label="Encerrando sessão inválida..." />
      </div>
    );
  }

  if (mfaPending) {
    return <MfaChallengeScreen onVerify={completeMfa} onCancel={signOut} />;
  }

  return <Outlet />;
}
