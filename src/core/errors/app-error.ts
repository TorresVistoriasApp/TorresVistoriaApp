export class AppError extends Error {
  readonly code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.name = "AppError";
    this.code = code;
  }
}

function humanizeDbError(message: string): string {
  if (message.includes("inspections_tenant_id_inspection_number_key")) {
    return "Não foi possível gerar o número da vistoria. Tente novamente em instantes.";
  }
  return message;
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) return error.message;
  if (error instanceof Error) return humanizeDbError(error.message);
  if (typeof error === "string") return humanizeDbError(error);
  if (error && typeof error === "object") {
    const record = error as Record<string, unknown>;
    if (typeof record.error_code === "string") return record.error_code;
    if (typeof record.msg === "string") return humanizeDbError(record.msg);
    if ("message" in record) return humanizeDbError(String(record.message));
  }
  return "Erro desconhecido";
}

export function throwIfError<T>(
  result: { data: T | null; error: unknown },
  fallbackMessage = "Operação falhou",
): T {
  if (result.error) {
    throw new AppError(getErrorMessage(result.error));
  }
  if (result.data === null) {
    throw new AppError(fallbackMessage);
  }
  return result.data;
}

/**
 * O supabase-js só expõe "Edge Function returned a non-2xx status code"; a mensagem
 * real vem no corpo da resposta, que precisa ser lido de forma assíncrona.
 */
export async function getEdgeErrorMessage(error: unknown): Promise<string> {
  const context = (error as { context?: Response } | null)?.context;
  if (typeof context?.json === "function") {
    try {
      const payload = (await context.json()) as { error?: string; message?: string };
      if (payload?.error) return String(payload.error);
      if (payload?.message) return String(payload.message);
    } catch {
      // corpo não-JSON ou já consumido: usa o fallback genérico
    }
  }
  return getErrorMessage(error);
}

export async function throwIfEdgeError<T extends Record<string, unknown>>(
  error: unknown,
  data: T | null,
): Promise<T> {
  if (error) {
    throw new AppError(await getEdgeErrorMessage(error));
  }
  if (data && "error" in data && data.error) {
    throw new AppError(String(data.error));
  }
  if (!data) {
    throw new AppError("Resposta vazia da Edge Function");
  }
  return data;
}
