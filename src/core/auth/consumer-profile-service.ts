import { db } from "@/infra/supabase/client";
import { AppError, getErrorMessage } from "@/core/errors/app-error";
import { formatUserFacingError } from "@/core/errors/user-facing-errors";
import type { ConsumerProfile } from "@/core/auth/types";

export const consumerProfileService = {
  async getSelf(userId: string): Promise<ConsumerProfile | null> {
    const { data, error } = await db
      .from("consumer_profiles")
      .select("*")
      .eq("id", userId)
      .is("deleted_at", null)
      .maybeSingle();

    if (error) throw new AppError(formatUserFacingError(getErrorMessage(error)));
    return (data as ConsumerProfile) ?? null;
  },
};
