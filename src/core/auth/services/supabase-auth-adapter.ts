import { db } from "@/infra/supabase/client";
import { AppError, getErrorMessage } from "@/core/errors/app-error";
import { formatUserFacingError } from "@/core/errors/user-facing-errors";
import { sanitizeEmail } from "@/shared/lib/sanitize";

/**
 * Operações comuns de Supabase Auth compartilhadas entre produtos do ecossistema.
 * Não contém regras de negócio por identidade — apenas chamadas ao Auth.
 */
export const supabaseAuthAdapter = {
  async signInWithPassword(email: string, password: string) {
    const safeEmail = sanitizeEmail(email);
    const { data, error } = await db.auth.signInWithPassword({
      email: safeEmail,
      password,
    });
    if (error) throw new AppError(formatUserFacingError(getErrorMessage(error)));
    return data;
  },

  async signUp(
    email: string,
    password: string,
    metadata?: Record<string, unknown>,
    emailRedirectTo?: string,
  ) {
    const safeEmail = sanitizeEmail(email);
    const { data, error } = await db.auth.signUp({
      email: safeEmail,
      password,
      options: {
        data: metadata,
        ...(emailRedirectTo ? { emailRedirectTo } : {}),
      },
    });
    if (error) throw new AppError(formatUserFacingError(getErrorMessage(error)));
    return data;
  },

  async signOut(): Promise<void> {
    const { error } = await db.auth.signOut();
    if (error) throw new AppError(formatUserFacingError(getErrorMessage(error)));
  },

  async resetPasswordForEmail(email: string, redirectTo: string): Promise<void> {
    const safeEmail = sanitizeEmail(email);
    const { error } = await db.auth.resetPasswordForEmail(safeEmail, { redirectTo });
    if (error) throw new AppError(formatUserFacingError(getErrorMessage(error)));
  },

  async updatePassword(password: string): Promise<void> {
    const { error } = await db.auth.updateUser({ password });
    if (error) throw new AppError(formatUserFacingError(getErrorMessage(error)));
  },

  async resendSignupVerification(email: string): Promise<void> {
    const safeEmail = sanitizeEmail(email);
    const { error } = await db.auth.resend({ type: "signup", email: safeEmail });
    if (error) throw new AppError(formatUserFacingError(getErrorMessage(error)));
  },

  async getSession() {
    const { data, error } = await db.auth.getSession();
    if (error) throw new AppError(formatUserFacingError(getErrorMessage(error)));
    return data.session;
  },
};
