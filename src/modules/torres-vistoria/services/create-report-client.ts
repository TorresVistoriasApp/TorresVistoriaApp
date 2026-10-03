import { db } from "@/infra/supabase/client";
import { throwIfEdgeError } from "@/core/errors/app-error";

export async function invokeCreateReport(
  body: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const { data, error } = await db.functions.invoke("create-report", { body });
  return throwIfEdgeError(error, data as Record<string, unknown> | null);
}
