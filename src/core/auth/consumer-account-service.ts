import { db } from "@/infra/supabase/client";
import { AppError, getErrorMessage } from "@/core/errors/app-error";
import { formatUserFacingError } from "@/core/errors/user-facing-errors";
import type { ConsumerProfile } from "@/core/auth/types";

function mapProfile(data: unknown): ConsumerProfile {
  return data as ConsumerProfile;
}

export const consumerAccountService = {
  async requestDeletion(): Promise<ConsumerProfile> {
    const { data, error } = await db.rpc("request_consumer_account_deletion");

    if (error) throw new AppError(formatUserFacingError(getErrorMessage(error)));
    if (!data) throw new AppError("Não foi possível solicitar a exclusão da conta.");

    return mapProfile(data);
  },

  async reactivate(): Promise<ConsumerProfile> {
    const { data, error } = await db.rpc("reactivate_consumer_account");

    if (error) throw new AppError(formatUserFacingError(getErrorMessage(error)));
    if (!data) throw new AppError("Não foi possível reativar a conta.");

    return mapProfile(data);
  },
};
