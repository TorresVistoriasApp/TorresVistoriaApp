import { AppError } from "@/core/errors/app-error";
import { USER_MESSAGES } from "@/core/errors/user-facing-errors";
import { consumerProfileService } from "@/core/auth/consumer-profile-service";
import { supabaseAuthAdapter } from "@/core/auth/services/supabase-auth-adapter";
import { ConsumerAccountStatus } from "@/core/auth/types";
import type {
  ConsumerForgotPasswordInput,
  ConsumerLoginInput,
  ConsumerRegisterInput,
  ConsumerResetPasswordInput,
} from "@/core/auth/schemas/consumer-auth";

const CONSUMER_LOGIN_DENIED =
  "Esta conta pertence à Torres Vistoria. Utilize o login de vistoriador.";

/**
 * Autenticação do consumidor B2C (Torres Consulta).
 * Usa Supabase Auth + validação de identidade em consumer_profiles.
 */
export const consumerAuthService = {
  async signIn(input: ConsumerLoginInput): Promise<void> {
    const { user } = await supabaseAuthAdapter.signInWithPassword(input.email, input.password);
    if (!user) throw new AppError(USER_MESSAGES.notAuthenticated);

    const profile = await consumerProfileService.getSelf(user.id);
    if (!profile) {
      await supabaseAuthAdapter.signOut();
      throw new AppError(CONSUMER_LOGIN_DENIED);
    }

    if (profile.account_status === ConsumerAccountStatus.PENDING_DELETION) {
      await supabaseAuthAdapter.signOut();
      throw new AppError(
        "Sua conta está programada para exclusão. Entre em contato com o suporte para recuperá-la.",
      );
    }

    if (profile.account_status === ConsumerAccountStatus.DELETED) {
      await supabaseAuthAdapter.signOut();
      throw new AppError(USER_MESSAGES.accountDisabled);
    }
  },

  async signUp(input: ConsumerRegisterInput): Promise<void> {
    await supabaseAuthAdapter.signUp(input.email, input.password, {
      full_name: input.name,
      user_type: "consumer",
    });
  },

  async signOut(): Promise<void> {
    await supabaseAuthAdapter.signOut();
  },

  async resetPassword(input: ConsumerForgotPasswordInput, redirectTo: string): Promise<void> {
    await supabaseAuthAdapter.resetPasswordForEmail(input.email, redirectTo);
  },

  async updatePassword(input: ConsumerResetPasswordInput): Promise<void> {
    await supabaseAuthAdapter.updatePassword(input.password);
  },

  async resendVerificationEmail(email: string): Promise<void> {
    await supabaseAuthAdapter.resendSignupVerification(email);
  },

  async getSession() {
    return supabaseAuthAdapter.getSession();
  },
};
