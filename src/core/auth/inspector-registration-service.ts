import { db } from "@/infra/supabase/client";
import { AppError, getErrorMessage } from "@/core/errors/app-error";
import { formatUserFacingError } from "@/core/errors/user-facing-errors";
import type { InspectorRegistration } from "@/core/auth/types";

export const inspectorRegistrationService = {
  async getSelf(userId: string): Promise<InspectorRegistration | null> {
    const { data, error } = await db
      .from("inspector_registrations")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) throw new AppError(formatUserFacingError(getErrorMessage(error)));
    return (data as InspectorRegistration) ?? null;
  },

  async listPendingForPlatformAdmin(): Promise<InspectorRegistration[]> {
    const { data, error } = await db
      .from("inspector_registrations")
      .select("*")
      .eq("status", "pending_approval")
      .order("created_at", { ascending: false });

    if (error) throw new AppError(formatUserFacingError(getErrorMessage(error)));
    return (data ?? []) as InspectorRegistration[];
  },
};

export function isPendingInspectorRegistration(
  registration: InspectorRegistration | null,
): boolean {
  return registration?.status === "pending_approval";
}

export function isRejectedInspectorRegistration(
  registration: InspectorRegistration | null,
): boolean {
  return registration?.status === "rejected";
}
