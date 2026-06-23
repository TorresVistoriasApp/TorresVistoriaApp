import { supabase } from "@/lib/supabase";
import { queries } from "@/lib/queries";
import { mutations } from "@/lib/mutations";
import { AppError, getErrorMessage, throwIfError } from "@/lib/errors";
import { compressToWebP } from "@/lib/compress-image";
import type { Profile } from "@/types";
import type { UserRole } from "@/lib/enums";
import type { UserProfileInput } from "@/schemas/user";

export type TeamProfile = {
  id: string;
  company_id: string;
  full_name: string;
  role: string;
  avatar_url: string | null;
  created_at: string;
};

export const userService = {
  async getCurrentProfile(userId: string): Promise<Profile | null> {
    try {
      const { data, error } = await queries.profiles.byId(userId);
      if (error && error.code !== "PGRST116") throw error;
      return (data ?? null) as Profile | null;
    } catch (error) {
      throw new AppError(getErrorMessage(error));
    }
  },

  async listTeam(companyId: string): Promise<TeamProfile[]> {
    try {
      const { data, error } = await queries.profiles.team(companyId);
      if (error) throw error;
      return (data ?? []) as TeamProfile[];
    } catch (error) {
      throw new AppError(getErrorMessage(error));
    }
  },

  async updateProfile(profileId: string, input: UserProfileInput): Promise<TeamProfile> {
    try {
      return throwIfError(
        await mutations.profiles.update(profileId, {
          full_name: input.full_name,
          avatar_url: input.avatar_url || null,
        }),
        "Erro ao atualizar perfil",
      ) as TeamProfile;
    } catch (error) {
      throw new AppError(getErrorMessage(error));
    }
  },

  async updateRole(profileId: string, role: UserRole): Promise<TeamProfile> {
    try {
      return throwIfError(
        await mutations.profiles.update(profileId, { role }),
        "Erro ao atualizar função",
      ) as TeamProfile;
    } catch (error) {
      throw new AppError(getErrorMessage(error));
    }
  },

  async updateAvatar(userId: string, file: File): Promise<string> {
    try {
      const compressed = await compressToWebP(file);
      const path = `avatars/${userId}/${Date.now()}.webp`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, compressed, { contentType: "image/webp", upsert: true });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);
      const { error } = await supabase
        .from("profiles")
        .update({ avatar_url: urlData.publicUrl })
        .eq("id", userId);
      if (error) throw error;
      return urlData.publicUrl;
    } catch (error) {
      throw new AppError(getErrorMessage(error));
    }
  },
};
