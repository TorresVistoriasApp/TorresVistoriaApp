import { getAuthRedirectUrl } from "@/config/env";
import { ROUTES } from "@/config/routes";
import { AppError } from "@/core/errors/app-error";
import { USER_MESSAGES } from "@/core/errors/user-facing-errors";
import { consumerProfileService } from "@/core/auth/consumer-profile-service";
import { inspectorRegistrationService } from "@/core/auth/inspector-registration-service";
import { supabaseAuthAdapter } from "@/core/auth/services/supabase-auth-adapter";
import { finalizeSession } from "@/core/auth/finalize-session";
import { ConsumerAccountStatus } from "@/core/auth/types";
import type {
  ConsumerForgotPasswordInput,
  ConsumerLoginInput,
  ConsumerRegisterInput,
  ConsumerResetPasswordInput,
} from "@/core/auth/schemas/consumer-auth";

const CONSUMER_LOGIN_DENIED =
  "Esta conta pertence à Torres Vistoria. Utilize o login de vistoriador.";

const PROFILE_READY_MAX_ATTEMPTS = 12;
const PROFILE_READY_DELAY_MS = 250;

async function waitForConsumerProfile(userId: string): Promise<void> {
  for (let attempt = 0; attempt < PROFILE_READY_MAX_ATTEMPTS; attempt++) {
    const profile = await consumerProfileService.getSelf(userId);
    if (profile) return;
    await new Promise((resolve) => setTimeout(resolve, PROFILE_READY_DELAY_MS));
  }

  throw new AppError(
    "Seu cadastro foi criado, mas o perfil ainda está sendo preparado. Aguarde alguns segundos e tente entrar.",
  );
}

/**
 * Autenticação do consumidor B2C (Torres Consulta).
 * Usa Supabase Auth + validação de identidade em consumer_profiles.
 */
export const consumerAuthService = {
  async signIn(input: ConsumerLoginInput, captchaToken?: string): Promise<void> {
    const { user } = await supabaseAuthAdapter.signInWithPassword(
      input.email,
      input.password,
      captchaToken,
    );
    if (!user) throw new AppError(USER_MESSAGES.notAuthenticated);

    const profile = await consumerProfileService.getSelf(user.id);
    if (!profile) {
      const inspectorRegistration = await inspectorRegistrationService.getSelf(user.id);
      if (inspectorRegistration) {
        await supabaseAuthAdapter.signOut();
        throw new AppError(CONSUMER_LOGIN_DENIED);
      }
      await supabaseAuthAdapter.signOut();
      throw new AppError(CONSUMER_LOGIN_DENIED);
    }

    if (profile.account_status === ConsumerAccountStatus.DELETED) {
      await supabaseAuthAdapter.signOut();
      throw new AppError(USER_MESSAGES.accountDisabled);
    }

    if (profile.account_status === ConsumerAccountStatus.PENDING_DELETION) {
      if (
        profile.deletion_scheduled_at &&
        new Date(profile.deletion_scheduled_at).getTime() <= Date.now()
      ) {
        await supabaseAuthAdapter.signOut();
        throw new AppError(
          "O prazo de recuperação da sua conta expirou e ela foi excluída permanentemente.",
        );
      }
    }
  },

  async signUp(
    input: ConsumerRegisterInput,
    captchaToken?: string,
  ): Promise<{ needsEmailConfirmation: boolean }> {
    const emailRedirectTo =
      typeof window !== "undefined" ? getAuthRedirectUrl(ROUTES.consultaApp) : undefined;

    const { session, user } = await supabaseAuthAdapter.signUp(
      input.email,
      input.password,
      {
        full_name: input.name,
        user_type: "consumer",
      },
      emailRedirectTo,
      captchaToken,
    );

    const identities = user?.identities;
    const looksLikeExistingEmail = Array.isArray(identities) && identities.length === 0;

    if (session?.user?.id && !looksLikeExistingEmail) {
      await waitForConsumerProfile(session.user.id);
      return { needsEmailConfirmation: false };
    }

    // Confirmação por e-mail (ou e-mail já existente): mesma resposta, sem enumerar.
    try {
      await supabaseAuthAdapter.signOut();
    } catch {
      // Sem sessão ativa — segue para a tela de confirmação.
    }

    return { needsEmailConfirmation: true };
  },

  async signOut(): Promise<void> {
    await supabaseAuthAdapter.signOut();
    await finalizeSession();
  },

  async resetPassword(
    input: ConsumerForgotPasswordInput,
    redirectTo: string,
    captchaToken?: string,
  ): Promise<void> {
    await supabaseAuthAdapter.resetPasswordForEmail(input.email, redirectTo, captchaToken);
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
