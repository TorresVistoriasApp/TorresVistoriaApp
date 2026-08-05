import { db } from "@/infra/supabase/client";
import { AppError, getErrorMessage } from "@/core/errors/app-error";
import { formatUserFacingError } from "@/core/errors/user-facing-errors";
import type { PlatformAdmin } from "@/core/auth/types";

export const platformAdminService = {
  async getSelf(userId: string): Promise<PlatformAdmin | null> {
    const { data, error } = await db
      .from("platform_admins")
      .select("*")
      .eq("id", userId)
      .is("deleted_at", null)
      .maybeSingle();

    if (error) throw new AppError(formatUserFacingError(getErrorMessage(error)));
    return (data as PlatformAdmin) ?? null;
  },
};
