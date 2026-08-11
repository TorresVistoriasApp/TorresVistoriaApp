import { db } from "@/infra/supabase/client";
import { AppError, getEdgeErrorMessage } from "@/core/errors/app-error";
import { formatUserFacingError, USER_MESSAGES } from "@/core/errors/user-facing-errors";
import type { CreateUserInput, UpdateUserInput } from "@/modules/admin/users/schemas/user-admin";

type AdminUsersAction =
  | { action: "create"; email: string; fullName: string; role: string; password: string }
  | { action: "update"; userId: string; email: string; fullName: string; role: string }
  | { action: "set-active"; userId: string; isActive: boolean };

async function parseFunctionInvokeError(
  error: unknown,
  data: Record<string, unknown> | null,
): Promise<string> {
  if (data?.error) return formatUserFacingError(String(data.error));
  return formatUserFacingError(await getEdgeErrorMessage(error));
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
