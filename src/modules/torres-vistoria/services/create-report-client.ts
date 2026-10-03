import { db } from "@/infra/supabase/client";
import {
  AppError,
  officialLaudoRateLimitMessage,
  parseRetryAfterSeconds,
  throwIfEdgeError,
} from "@/core/errors/app-error";

function retryAfterFromResponse(response: { headers?: { get?: (name: string) => string | null } } | null | undefined): number | null {
  return parseRetryAfterSeconds(response?.headers?.get?.("Retry-After"));
}

function isRateLimitPayload(data: unknown): boolean {
  if (!data || typeof data !== "object") return false;
  const record = data as Record<string, unknown>;
  const text = [record.error, record.message, record.msg]
    .filter((value) => typeof value === "string")
    .join(" ");
  return /muitas tentativas/i.test(text) || /too many requests/i.test(text) || /limite temporário/i.test(text);
}

export function unwrapCreateReportPayload(data: unknown): Record<string, unknown> | null {
  if (!data || typeof data !== "object" || Array.isArray(data)) return null;
  const record = data as Record<string, unknown>;
  const nested = record.data;
  if (
    nested &&
    typeof nested === "object" &&
    !Array.isArray(nested) &&
    ("issueToken" in nested ||
      "needsClientPdf" in nested ||
      "integrityHash" in nested ||
      "verificationCode" in nested)
  ) {
    return nested as Record<string, unknown>;
  }
  return record;
}

export async function invokeCreateReport(
  body: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const result = await db.functions.invoke("create-report", { body });
  const response = (result as { response?: Response }).response;
  if (response?.status === 429) {
    throw new AppError(officialLaudoRateLimitMessage(retryAfterFromResponse(response)));
  }

  const payload = unwrapCreateReportPayload(result.data);
  if (isRateLimitPayload(payload) || isRateLimitPayload(result.data)) {
    throw new AppError(officialLaudoRateLimitMessage(retryAfterFromResponse(response)));
  }

  return throwIfEdgeError(result.error, payload);
}
