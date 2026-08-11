import { db } from "@/infra/supabase/client";
import { AppError, getEdgeErrorMessage } from "@/core/errors/app-error";
import { formatUserFacingError, USER_MESSAGES } from "@/core/errors/user-facing-errors";
import type { InspectorRegistration } from "@/core/auth/types";
import type { UserRole } from "@/core/rbac/roles";

export interface InspectorRegistrationListItem extends InspectorRegistration {
  suggestedTenantId: string | null;
  suggestedTenantName: string | null;
}

async function parseFunctionInvokeError(
  error: unknown,
  data: Record<string, unknown> | null,
): Promise<string> {
  if (data?.error) return formatUserFacingError(String(data.error));
  return formatUserFacingError(await getEdgeErrorMessage(error));
}

export const platformInspectorRegistrationService = {
  async listPending(): Promise<InspectorRegistrationListItem[]> {
    const { data, error } = await db.functions.invoke("inspector-registrations", {
      body: { action: "list" },
    });

    const payload = (data ?? null) as { items?: InspectorRegistrationListItem[]; error?: string } | null;
    if (error || payload?.error) {
      throw new AppError(await parseFunctionInvokeError(error, payload));
    }

    return payload?.items ?? [];
  },

  async approve(input: {
    registrationId: string;
    tenantId: string;
    role: UserRole;
  }): Promise<void> {
    const { data, error } = await db.functions.invoke("inspector-registrations", {
      body: {
        action: "approve",
        registrationId: input.registrationId,
        tenantId: input.tenantId,
        role: input.role,
      },
    });

    const payload = (data ?? null) as Record<string, unknown> | null;
    if (error || payload?.error) {
      throw new AppError(await parseFunctionInvokeError(error, payload));
    }
    if (!payload) {
      throw new AppError(USER_MESSAGES.emptyFunctionResponse);
    }
  },

  async reject(input: { registrationId: string; rejectionReason?: string }): Promise<void> {
    const { data, error } = await db.functions.invoke("inspector-registrations", {
      body: {
        action: "reject",
        registrationId: input.registrationId,
        rejectionReason: input.rejectionReason,
      },
    });

    const payload = (data ?? null) as Record<string, unknown> | null;
    if (error || payload?.error) {
      throw new AppError(await parseFunctionInvokeError(error, payload));
    }
    if (!payload) {
      throw new AppError(USER_MESSAGES.emptyFunctionResponse);
    }
  },
};
