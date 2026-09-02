import { db } from "@/infra/supabase/client";
import { AppError, getErrorMessage, throwIfEdgeError } from "@/core/errors/app-error";
import { formatUserFacingError } from "@/core/errors/user-facing-errors";
import { sanitizeEmail } from "@/shared/lib/sanitize";
import { getAppUrl } from "@/config/env";

function captchaOptions(captchaToken?: string) {
  return captchaToken ? { captchaToken } : {};
}

/**
 * Operações comuns de Supabase Auth compartilhadas entre produtos do ecossistema.
 * Não contém regras de negócio por identidade — apenas chamadas ao Auth.
 */
export const supabaseAuthAdapter = {
  async signInWithPassword(email: string, password: string, captchaToken?: string) {
    const safeEmail = sanitizeEmail(email);
    const { data, error } = await db.auth.signInWithPassword({
      email: safeEmail,
      password,
      options: captchaOptions(captchaToken),
    });
    if (error) throw new AppError(formatUserFacingError(getErrorMessage(error)));
    return data;
  },

  async signUp(
    email: string,
    password: string,
    metadata?: Record<string, unknown>,
    emailRedirectTo?: string,
    captchaToken?: string,
  ) {
    const safeEmail = sanitizeEmail(email);
    const { data, error } = await db.auth.signUp({
      email: safeEmail,
      password,
      options: {
        data: metadata,
        ...(emailRedirectTo ? { emailRedirectTo } : {}),
        ...captchaOptions(captchaToken),
      },
    });
    if (error) throw new AppError(formatUserFacingError(getErrorMessage(error)));

    return data;
  },

  /**
   * Cadastro de vistoriador: o documento vai só à Edge (HMAC + intent).
   * Nunca entra em Auth metadata, JWT ou sessão.
   */
  async signUpInspector(input: {
    name: string;
    email: string;
    phone?: string;
    document: string;
    documentType: "cpf" | "cnpj";
    password: string;
    acceptTerms: boolean;
    captchaToken?: string;
  }): Promise<void> {
    const { data, error } = await db.functions.invoke("inspector-signup", {
      body: {
        name: input.name,
        email: sanitizeEmail(input.email),
        phone: input.phone?.trim() || undefined,
        document: input.document,
        documentType: input.documentType,
        password: input.password,
        acceptTerms: input.acceptTerms,
        ...(input.captchaToken ? { captchaToken: input.captchaToken } : {}),
      },
    });
    await throwIfEdgeError(error, (data ?? null) as Record<string, unknown> | null);
  },

  async signOut(): Promise<void> {
    const { error } = await db.auth.signOut();
    if (error) throw new AppError(formatUserFacingError(getErrorMessage(error)));
  },

  async resetPasswordForEmail(
    email: string,
    redirectTo: string,
    captchaToken?: string,
  ): Promise<void> {
    // Defesa em profundidade contra open-redirect.
    if (!redirectTo || typeof redirectTo !== "string") throw new AppError("redirectTo inválido");

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

    if (runtimeOrigin && redirectUrl.origin === runtimeOrigin) {
      // ok
    } else if (expectedOrigin && redirectUrl.origin === expectedOrigin) {
      // ok
    } else {
      throw new AppError("redirectTo inválido");
    }

    const safeEmail = sanitizeEmail(email);
    const { error } = await db.auth.resetPasswordForEmail(safeEmail, {
      redirectTo,
      ...captchaOptions(captchaToken),
    });
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

  /**
   * Remove `document` do metadata da própria conta e recarrega o JWT.
   * Sem sessão (confirmação de e-mail pendente) o trigger já apagou no banco.
   */
  async stripOwnAuthDocumentMetadata(): Promise<void> {
    const session = await supabaseAuthAdapter.getSession();
    if (!session) return;

    const { error } = await db.rpc("strip_own_auth_document_metadata");
    if (error) throw new AppError(formatUserFacingError(getErrorMessage(error)));

    const { error: refreshError } = await db.auth.refreshSession();
    if (refreshError) throw new AppError(formatUserFacingError(getErrorMessage(refreshError)));
  },
};
