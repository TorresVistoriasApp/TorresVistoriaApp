import { db } from "@/infra/supabase/client";
import { AppError, getErrorMessage } from "@/core/errors/app-error";
import { formatUserFacingError, USER_MESSAGES } from "@/core/errors/user-facing-errors";
import { sanitizeEmail } from "@/shared/lib/sanitize";
import { resolveStorageUrl } from "@/infra/storage/signed-url";
import { AVATARS_BUCKET } from "@/infra/storage/buckets";
import { platformAdminService } from "@/core/auth/platform-admin-service";
import { inspectorAuthService } from "@/core/auth/services/inspector-auth-service";
import { auditService } from "@/core/audit/audit-service";
import { getAppUrl } from "@/config/env";
import type { Profile } from "@/core/auth/types";
import type { ChangePasswordInput } from "@/core/auth/schemas/auth";

function assertAllowedAuthRedirectUrl(redirectTo: string): void {
  // Defesa em profundidade contra open-redirect:
  // só permitimos redirecionamento para a origem do próprio app (ou a origem canônica do ambiente).
  if (!redirectTo || typeof redirectTo !== "string") {
    throw new AppError("redirectTo inválido");
  }

  const appBase = getAppUrl();
  let expectedOrigin: string | null = null;
  try {
    expectedOrigin = new URL(appBase).origin;
  } catch {
    expectedOrigin = null;
  }

  const runtimeOrigin =
    typeof window !== "undefined" && window.location?.origin ? window.location.origin : null;

  let redirectUrl: URL;
  try {
    redirectUrl = new URL(redirectTo);
  } catch {
    throw new AppError("redirectTo inválido");
  }

  if (runtimeOrigin && redirectUrl.origin === runtimeOrigin) return;
  if (expectedOrigin && redirectUrl.origin === expectedOrigin) return;

  throw new AppError("redirectTo inválido");
}

export const authService = {
  async signIn(email: string, password: string, captchaToken?: string): Promise<void> {
    const safeEmail = sanitizeEmail(email);
    const { data, error } = await db.auth.signInWithPassword({
      email: safeEmail,
      password,
      options: captchaToken ? { captchaToken } : {},
    });
    if (error) throw new AppError(formatUserFacingError(getErrorMessage(error)));

    const profile = await authService.getProfile(data.user.id);
    if (profile && !profile.is_active) {
      await db.auth.signOut();
      throw new AppError(USER_MESSAGES.accountDisabled);
    }

    if (!profile) {
      const platformAdmin = await platformAdminService.getSelf(data.user.id);
      if (platformAdmin && !platformAdmin.is_active) {
        await db.auth.signOut();
        throw new AppError(USER_MESSAGES.accountDisabled);
      }

      await inspectorAuthService.validateTenantLogin(data.user.id);
    }

    await auditService.recordEvent({ action: "LOGIN", entityType: "auth" }).catch(() => undefined);
  },

  async signOut(): Promise<void> {
    await auditService.recordEvent({ action: "LOGOUT", entityType: "auth" }).catch(() => undefined);
    const { error } = await db.auth.signOut();
    if (error) throw new AppError(formatUserFacingError(getErrorMessage(error)));
  },

  async resetPassword(email: string, redirectTo: string, captchaToken?: string): Promise<void> {
    assertAllowedAuthRedirectUrl(redirectTo);
    const safeEmail = sanitizeEmail(email);
    const { error } = await db.auth.resetPasswordForEmail(safeEmail, {
      redirectTo,
      ...(captchaToken ? { captchaToken } : {}),
    });
    if (error) throw new AppError(formatUserFacingError(getErrorMessage(error)));
  },

  async updatePassword(password: string): Promise<void> {
    const { error } = await db.auth.updateUser({ password });
    if (error) throw new AppError(formatUserFacingError(getErrorMessage(error)));
  },

  async completePasswordChange(input: ChangePasswordInput): Promise<void> {
    const {
      data: { user },
      error: userError,
    } = await db.auth.getUser();
    if (userError) throw new AppError(formatUserFacingError(getErrorMessage(userError)));
    if (!user) throw new AppError(USER_MESSAGES.notAuthenticated);

    await authService.updatePassword(input.password);

    const { error } = await db
      .from("profiles")
      .update({ must_change_password: false })
      .eq("id", user.id);

    if (error) throw new AppError(formatUserFacingError(getErrorMessage(error)));
  },

  async getSession() {
    const { data, error } = await db.auth.getSession();
    if (error) throw new AppError(formatUserFacingError(getErrorMessage(error)));
    return data.session;
  },

  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await db
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .is("deleted_at", null)
      .maybeSingle();

    if (error) throw new AppError(formatUserFacingError(getErrorMessage(error)));
    if (!data) return null;
    const profile = data as Profile;
    profile.avatar_url = await resolveStorageUrl(AVATARS_BUCKET, profile.avatar_url);
    return profile;
  },
};
