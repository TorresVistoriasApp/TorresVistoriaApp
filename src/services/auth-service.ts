import { supabase } from "@/lib/supabase";
import { AppError, getErrorMessage, throwIfEdgeError } from "@/lib/errors";
import type { Profile } from "@/types";
import type { InviteUserInput } from "@/schemas/auth";

export const authService = {
  async signIn(email: string, password: string): Promise<void> {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new AppError(getErrorMessage(error));
  },

  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw new AppError(getErrorMessage(error));
  },

  async resetPassword(email: string, redirectTo: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) throw new AppError(getErrorMessage(error));
  },

  async updatePassword(password: string): Promise<void> {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw new AppError(getErrorMessage(error));
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw new AppError(getErrorMessage(error));
    return data.session;
  },

  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .is("deleted_at", null)
      .maybeSingle();

    if (error) throw new AppError(getErrorMessage(error));
    return data as Profile | null;
  },

  async inviteUser(input: InviteUserInput): Promise<Record<string, unknown>> {
    const { data, error } = await supabase.functions.invoke("invite-user", {
      body: input,
    });
    return throwIfEdgeError(error, data as Record<string, unknown> | null);
  },
};
