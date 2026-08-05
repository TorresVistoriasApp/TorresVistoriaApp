import { db } from "@/infra/supabase/client";
import { AppError, getErrorMessage } from "@/core/errors/app-error";
import { formatUserFacingError } from "@/core/errors/user-facing-errors";
import { sanitizeEmail } from "@/shared/lib/sanitize";
import type {
  ConsumerForgotPasswordInput,
  ConsumerLoginInput,
  ConsumerRegisterInput,
  ConsumerResetPasswordInput,
} from "@/modules/torres-consulta/auth/schemas/consumer-auth";

/**
 * Serviço de autenticação do consumidor final (B2C).
 *
 * Utiliza Supabase Auth com fluxos preparados para login, cadastro,
 * recuperação de senha, verificação de e-mail e refresh token automático.
 *
 * A persistência de perfil do consumidor será implementada em migration futura.
 */
export const consumerAuthService = {
  async signIn(input: ConsumerLoginInput): Promise<void> {
    const email = sanitizeEmail(input.email);
    const { error } = await db.auth.signInWithPassword({
      email,
      password: input.password,
    });
    if (error) throw new AppError(formatUserFacingError(getErrorMessage(error)));
  },

  async signUp(input: ConsumerRegisterInput): Promise<void> {
    const email = sanitizeEmail(input.email);
    const { error } = await db.auth.signUp({
      email,
      password: input.password,
      options: {
        data: {
          full_name: input.name,
          phone: input.phone || null,
          user_type: "consumer",
        },
      },
    });
    if (error) throw new AppError(formatUserFacingError(getErrorMessage(error)));
  },

  async signOut(): Promise<void> {
    const { error } = await db.auth.signOut();
    if (error) throw new AppError(formatUserFacingError(getErrorMessage(error)));
  },

  async resetPassword(input: ConsumerForgotPasswordInput, redirectTo: string): Promise<void> {
    const email = sanitizeEmail(input.email);
    const { error } = await db.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) throw new AppError(formatUserFacingError(getErrorMessage(error)));
  },

  async updatePassword(input: ConsumerResetPasswordInput): Promise<void> {
    const { error } = await db.auth.updateUser({ password: input.password });
    if (error) throw new AppError(formatUserFacingError(getErrorMessage(error)));
  },

  async resendVerificationEmail(email: string): Promise<void> {
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
