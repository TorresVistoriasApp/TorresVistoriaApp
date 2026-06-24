import { db } from "@/lib/db-client";
import { AppError, getErrorMessage } from "@/lib/errors";
import { formatUserFacingError, USER_MESSAGES } from "@/lib/user-facing-errors";
import type { CreateUserInput, UpdateUserInput } from "@/features/users/schemas/user-admin";

type AdminUsersAction =
  | { action: "create"; email: string; fullName: string; role: string; password: string }
  | { action: "update"; userId: string; email: string; fullName: string; role: string }
  | { action: "set-active"; userId: string; isActive: boolean };

async function parseFunctionInvokeError(
  error: unknown,
  data: Record<string, unknown> | null,
): Promise<string> {
  if (data?.error) return formatUserFacingError(String(data.error));

  const fnError = error as { context?: Response; message?: string; name?: string };
  if (fnError.context) {
    try {
      const payload = (await fnError.context.json()) as {
        error?: string;
        message?: string;
        code?: string;
      };
      if (payload.error) return formatUserFacingError(payload.error);
      if (payload.message) return formatUserFacingError(payload.message);
    } catch {
      // ignore JSON parse errors
    }
  }

  return formatUserFacingError(getErrorMessage(error));
}

async function invokeAdminUsers(body: AdminUsersAction): Promise<Record<string, unknown>> {
  const { data, error } = await db.functions.invoke("invite-user", { body });
  const payload = (data ?? null) as Record<string, unknown> | null;

  if (error || payload?.error) {
    throw new AppError(await parseFunctionInvokeError(error, payload));
  }

  if (!payload) {
    throw new AppError(USER_MESSAGES.emptyFunctionResponse);
  }

  return payload;
}

/** Operações privilegiadas de gestão de usuários (Super Admin → edge function). */
export const adminUsersService = {
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
