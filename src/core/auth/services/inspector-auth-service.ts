import { AppError } from "@/core/errors/app-error";
import { consumerProfileService } from "@/core/auth/consumer-profile-service";
import {
  inspectorRegistrationService,
  isPendingInspectorRegistration,
  isRejectedInspectorRegistration,
} from "@/core/auth/inspector-registration-service";
import { supabaseAuthAdapter } from "@/core/auth/services/supabase-auth-adapter";
import { normalizeInspectorDocument } from "@/core/auth/validators/document";
import type { InspectorRegisterInput } from "@/core/auth/schemas/inspector-auth";

const INSPECTOR_LOGIN_DENIED =
  "Esta conta pertence ao Torres Consulta. Utilize o login de consumidor.";

const PENDING_APPROVAL_MESSAGE =
  "Seu cadastro está em análise. Você receberá acesso ao painel após aprovação.";

const REJECTED_MESSAGE =
  "Seu cadastro foi recusado. Entre em contato com o suporte para mais informações.";

/**
 * Autenticação e cadastro de vistoriador (self-signup B2B com aprovação).
 */
export const inspectorAuthService = {
  async signUp(input: InspectorRegisterInput, captchaToken?: string): Promise<void> {
    const documentDigits = normalizeInspectorDocument(input.document, input.documentType);

    await supabaseAuthAdapter.signUpInspector({
      name: input.name,
      email: input.email,
      phone: input.phone?.trim() || undefined,
      document: documentDigits,
      documentType: input.documentType,
      password: input.password,
      acceptTerms: input.acceptTerms,
      ...(captchaToken ? { captchaToken } : {}),
    });
  },

  async validateTenantLogin(userId: string): Promise<void> {
    const consumerProfile = await consumerProfileService.getSelf(userId);
    if (consumerProfile) {
      await supabaseAuthAdapter.signOut();
      throw new AppError(INSPECTOR_LOGIN_DENIED);
    }

    await supabaseAuthAdapter.stripOwnAuthDocumentMetadata();

    const registration = await inspectorRegistrationService.getSelf(userId);
    if (isPendingInspectorRegistration(registration)) {
      return;
    }

    if (isRejectedInspectorRegistration(registration)) {
      await supabaseAuthAdapter.signOut();
      throw new AppError(registration?.rejection_reason ?? REJECTED_MESSAGE);
    }
  },

  async signOut(): Promise<void> {
    await supabaseAuthAdapter.signOut();
  },

  async resendVerificationEmail(email: string): Promise<void> {
    await supabaseAuthAdapter.resendSignupVerification(email);
  },

  getPendingMessage(): string {
    return PENDING_APPROVAL_MESSAGE;
  },
};

export async function ensureNotConsumerAccount(userId: string): Promise<void> {
  const consumerProfile = await consumerProfileService.getSelf(userId);
  if (consumerProfile) {
    throw new AppError(INSPECTOR_LOGIN_DENIED);
  }
}

export async function getInspectorRegistrationState(userId: string) {
  const registration = await inspectorRegistrationService.getSelf(userId);
  return {
    registration,
    isPending: isPendingInspectorRegistration(registration),
    isRejected: isRejectedInspectorRegistration(registration),
  };
}
