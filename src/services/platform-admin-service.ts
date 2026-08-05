import { db } from "@/lib/db-client";
import { AppError, getErrorMessage } from "@/lib/errors";
import { formatUserFacingError } from "@/lib/user-facing-errors";
import type { PlatformAdmin } from "@/types";

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
