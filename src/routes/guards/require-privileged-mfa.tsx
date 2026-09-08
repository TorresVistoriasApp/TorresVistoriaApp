import { type ReactNode } from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "@/core/auth/use-auth";
import { MfaEnrollScreen, MfaAssuranceUnknownScreen } from "@/core/auth/components/mfa-challenge-form";
import { LoadingSpinner } from "@/shared/components/loading-spinner";

/** SUPER_ADMIN e operador da plataforma não entram no painel sem TOTP. */
export function RequirePrivilegedMfa({ children }: { children?: ReactNode }) {
  const { mfaEnrollmentRequired, mfaAssuranceUnknown, completeMfaEnrollment, retryMfaCheck, signOut, loading } =
    useAuth();

  if (loading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (mfaAssuranceUnknown) {
    return <MfaAssuranceUnknownScreen onRetry={retryMfaCheck} onCancel={signOut} />;
  }

  if (mfaEnrollmentRequired) {
    return <MfaEnrollScreen onEnrolled={completeMfaEnrollment} onCancel={signOut} />;
  }

  return children ?? <Outlet />;
}
