import { db } from "@/lib/db-client";
import { AppError, getErrorMessage } from "@/lib/errors";
import { formatUserFacingError, USER_MESSAGES } from "@/lib/user-facing-errors";
import type { Company } from "@/services/company-service";
import type { OnboardCompanyInput } from "@/schemas/platform-admin";

async function parseFunctionInvokeError(
  error: unknown,
  data: Record<string, unknown> | null,
): Promise<string> {
  if (data?.error) return formatUserFacingError(String(data.error));

  const fnError = error as { context?: Response; message?: string };
  if (fnError?.context) {
    try {
      const payload = (await fnError.context.json()) as { error?: string; message?: string };
      if (payload.error) return formatUserFacingError(payload.error);
      if (payload.message) return formatUserFacingError(payload.message);
    } catch {
      // ignore JSON parse errors
    }
  }

  return formatUserFacingError(getErrorMessage(error));
}

export const platformCompanyService = {
  /** Só retorna dados para quem está em `platform_admins` (RLS `companies_platform_all`). */
  async list(): Promise<Company[]> {
    const { data, error } = await db
      .from("companies")
      .select("*")
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) throw new AppError(formatUserFacingError(getErrorMessage(error)));
    return (data ?? []) as Company[];
  },

  async onboard(input: OnboardCompanyInput): Promise<{ companyId: string; adminUserId: string }> {
    const { data, error } = await db.functions.invoke("onboard-company", {
      body: {
        tradeName: input.tradeName,
        legalName: input.legalName || undefined,
        document: input.document || undefined,
        companyEmail: input.companyEmail || undefined,
        companyPhone: input.companyPhone || undefined,
        subscriptionPlan: input.subscriptionPlan,
        adminFullName: input.adminFullName,
        adminEmail: input.adminEmail,
        adminPassword: input.adminPassword,
      },
    });

    const payload = (data ?? null) as Record<string, unknown> | null;
    if (error || payload?.error) {
      throw new AppError(await parseFunctionInvokeError(error, payload));
    }
    if (!payload) {
      throw new AppError(USER_MESSAGES.emptyFunctionResponse);
    }

    return { companyId: payload.companyId as string, adminUserId: payload.adminUserId as string };
  },
};
