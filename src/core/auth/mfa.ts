import { db } from "@/infra/supabase/client";
import { AppError, getErrorMessage } from "@/core/errors/app-error";
import { formatUserFacingError } from "@/core/errors/user-facing-errors";
import { UserRole } from "@/core/rbac/roles";
import type { Profile } from "@/core/auth/types";

function asAuthError(error: unknown): AppError {
  return new AppError(formatUserFacingError(getErrorMessage(error)));
}

export function isPrivilegedAccount(
  profile: Pick<Profile, "role"> | null | undefined,
  isPlatformAdmin: boolean,
): boolean {
  return isPlatformAdmin || profile?.role === UserRole.SUPER_ADMIN;
}

/** Conta com TOTP verificado ainda em AAL1 — senha sozinha não completa o login. */
export async function isMfaChallengeRequired(): Promise<boolean> {
  const { data, error } = await db.auth.mfa.getAuthenticatorAssuranceLevel();
  if (error || !data) return false;
  return data.nextLevel === "aal2" && data.currentLevel !== "aal2";
}

/** `null` = consulta falhou (não assumir ausência de fator). */
export async function hasVerifiedTotpFactor(): Promise<boolean | null> {
  const { data, error } = await db.auth.mfa.listFactors();
  if (error) return null;
  return (data?.totp ?? []).some((factor) => factor.status === "verified");
}

export async function verifyMfaTotpCode(code: string): Promise<void> {
  const trimmed = code.trim();
  if (trimmed.length < 6) {
    throw new AppError("Informe o código de 6 dígitos do autenticador.");
  }

  const { data: factors, error: listError } = await db.auth.mfa.listFactors();
  if (listError) throw asAuthError(listError);

  const totp =
    factors?.totp?.find((factor) => factor.status === "verified") ?? factors?.totp?.[0];
  if (!totp) {
    throw new AppError("Não há um autenticador ativo nesta conta.");
  }

  const { data: challenge, error: challengeError } = await db.auth.mfa.challenge({
    factorId: totp.id,
  });
  if (challengeError) throw asAuthError(challengeError);
  if (!challenge?.id) throw new AppError("Não foi possível iniciar a verificação em duas etapas.");

  const { error: verifyError } = await db.auth.mfa.verify({
    factorId: totp.id,
    challengeId: challenge.id,
    code: trimmed,
  });
  if (verifyError) throw asAuthError(verifyError);
}
