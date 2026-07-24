import { db } from "@/lib/db-client";
import { queries } from "@/lib/queries";
import { mutations } from "@/lib/mutations";
import { AppError, getErrorMessage, throwIfError } from "@/lib/errors";
import { compressToWebP } from "@/lib/compress-image";
import { AVATARS_BUCKET } from "@/lib/storage-buckets";
import { getSignedUrl, resolveStorageUrl } from "@/lib/storage-url";
import type { Profile } from "@/types";
import type { UserRole } from "@/lib/enums";
import type { UserProfileInput } from "@/schemas/user";

export type TeamProfile = {
  id: string;
  company_id: string;
  full_name: string;
  role: string;
  avatar_url: string | null;
  email: string | null;
  is_active: boolean;
  must_change_password: boolean;
  created_at: string;
};

async function withSignedAvatar<T extends { avatar_url?: string | null }>(row: T): Promise<T> {
  const avatar_url = await resolveStorageUrl(AVATARS_BUCKET, row.avatar_url);
  return { ...row, avatar_url };
}

export const userService = {
  async getCurrentProfile(userId: string): Promise<Profile | null> {
    try {
      const { data, error } = await queries.profiles.byId(userId);
      if (error && error.code !== "PGRST116") throw error;
      if (!data) return null;
      return (await withSignedAvatar(data as Profile)) as Profile;
    } catch (error) {
      throw new AppError(getErrorMessage(error));
    }
  },

  async listTeam(companyId: string): Promise<TeamProfile[]> {
    try {
      const { data, error } = await queries.profiles.team(companyId);
      if (error) throw error;
      const rows = (data ?? []) as TeamProfile[];
      return Promise.all(rows.map((row) => withSignedAvatar(row)));
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
      const path = `${userId}/avatar.webp`;
      const { error: uploadError } = await db.storage
        .from(AVATARS_BUCKET)
        .upload(path, compressed, { contentType: "image/webp", upsert: true });
      if (uploadError) throw uploadError;

      // Persiste o path (não URL pública). A UI resolve com URL assinada.
      const { error } = await db.from("profiles").update({ avatar_url: path }).eq("id", userId);
      if (error) throw error;
      return (await getSignedUrl(AVATARS_BUCKET, path)) ?? path;
    } catch (error) {
      throw new AppError(getErrorMessage(error));
    }
  },
};
