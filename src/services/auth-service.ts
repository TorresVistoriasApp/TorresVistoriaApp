import { db } from "@/lib/db-client";
import { AppError, getErrorMessage } from "@/lib/errors";
import { sanitizeEmail } from "@/lib/sanitize";
import type { Profile } from "@/types";
import type { ChangePasswordInput, CreateUserInput, UpdateUserInput } from "@/schemas/auth";

type AdminUsersAction =
  | { action: "create"; email: string; fullName: string; role: string; password: string }
  | { action: "update"; userId: string; email: string; fullName: string; role: string }
  | { action: "set-active"; userId: string; isActive: boolean };

async function parseFunctionInvokeError(
  error: unknown,
  data: Record<string, unknown> | null,
): Promise<string> {
  if (data?.error) return String(data.error);

  const fnError = error as { context?: Response; message?: string; name?: string };
  if (fnError.context) {
    try {
      const payload = (await fnError.context.json()) as {
        error?: string;
        message?: string;
        code?: string;
      };
      if (payload.code === "NOT_FOUND" || payload.message?.includes("not found")) {
        return "A função invite-user ainda não foi publicada no Supabase. No terminal, execute: npx supabase login && npx supabase functions deploy invite-user --project-ref ljzttzfjtskblxekmquu";
      }
      if (payload.error) return payload.error;
      if (payload.message) return payload.message;
    } catch {
      // ignore JSON parse errors
    }
  }

  const message = getErrorMessage(error);
  if (/not found|404/i.test(message)) {
    return "A função invite-user ainda não foi publicada no Supabase. No terminal, execute: npx supabase login && npx supabase functions deploy invite-user --project-ref ljzttzfjtskblxekmquu";
  }
  if (/edge function|non-2xx|failed to fetch/i.test(message)) {
    return "Não foi possível contactar a função invite-user no Supabase. Verifique se a Edge Function foi publicada.";
  }

  return message;
}

async function invokeAdminUsers(body: AdminUsersAction): Promise<Record<string, unknown>> {
  const { data, error } = await db.functions.invoke("invite-user", { body });
  const payload = (data ?? null) as Record<string, unknown> | null;

  if (error || payload?.error) {
    throw new AppError(await parseFunctionInvokeError(error, payload));
  }

  if (!payload) {
    throw new AppError("Resposta vazia da Edge Function invite-user");
  }

  return payload;
}

export const authService = {
  async signIn(email: string, password: string): Promise<void> {
    const safeEmail = sanitizeEmail(email);
    const { data, error } = await db.auth.signInWithPassword({ email: safeEmail, password });
    if (error) throw new AppError(getErrorMessage(error));

    const profile = await authService.getProfile(data.user.id);
    if (profile && !profile.is_active) {
      await db.auth.signOut();
      throw new AppError("Conta desativada. Entre em contato com o administrador.");
    }
  },

  async signOut(): Promise<void> {
    const { error } = await db.auth.signOut();
    if (error) throw new AppError(getErrorMessage(error));
  },

  async resetPassword(email: string, redirectTo: string): Promise<void> {
    const safeEmail = sanitizeEmail(email);
    const { error } = await db.auth.resetPasswordForEmail(safeEmail, { redirectTo });
    if (error) throw new AppError(getErrorMessage(error));
  },

  async updatePassword(password: string): Promise<void> {
    const { error } = await db.auth.updateUser({ password });
    if (error) throw new AppError(getErrorMessage(error));
  },

  async completePasswordChange(input: ChangePasswordInput): Promise<void> {
    const {
      data: { user },
      error: userError,
    } = await db.auth.getUser();
    if (userError) throw new AppError(getErrorMessage(userError));
    if (!user) throw new AppError("Não autenticado");

    await authService.updatePassword(input.password);

    const { error } = await db
      .from("profiles")
      .update({ must_change_password: false })
      .eq("id", user.id);

    if (error) throw new AppError(getErrorMessage(error));
  },

  async getSession() {
    const { data, error } = await db.auth.getSession();
    if (error) throw new AppError(getErrorMessage(error));
    return data.session;
  },

  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await db
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .is("deleted_at", null)
      .maybeSingle();

    if (error) throw new AppError(getErrorMessage(error));
    return data as Profile | null;
  },

  async createUser(input: CreateUserInput): Promise<Record<string, unknown>> {
    return invokeAdminUsers({
      action: "create",
      email: input.email,
      fullName: input.fullName,
      role: input.role,
      password: input.password,
    });
  },

  async updateUser(userId: string, input: UpdateUserInput): Promise<Record<string, unknown>> {
    return invokeAdminUsers({
      action: "update",
      userId,
      email: input.email,
      fullName: input.fullName,
      role: input.role,
    });
  },

  async setUserActive(userId: string, isActive: boolean): Promise<Record<string, unknown>> {
    return invokeAdminUsers({ action: "set-active", userId, isActive });
  },
};
