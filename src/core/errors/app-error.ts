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
  if (error && typeof error === "object") {
    const record = error as Record<string, unknown>;
    if (typeof record.code === "string" && record.code) return record.code;
    if (typeof record.error_code === "string") return record.error_code;
    if (typeof record.msg === "string") return humanizeDbError(record.msg);
    if ("message" in record && typeof record.message === "string") {
      return humanizeDbError(record.message);
    }
  }
  if (error instanceof Error) return humanizeDbError(error.message);
  if (typeof error === "string") return humanizeDbError(error);
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

function edgeResponseFromError(error: unknown): Response | null {
  const context = (error as { context?: Response } | null)?.context;
  if (context && typeof context.status === "number") {
    return context;
  }
  return null;
}

export function parseRetryAfterSeconds(value: string | null | undefined): number | null {
  if (!value) return null;
  const seconds = Number(value.trim());
  if (!Number.isFinite(seconds) || seconds <= 0) return null;
  return Math.ceil(seconds);
}

export function formatRetryAfterWait(retryAfterSec: number): string {
  const seconds = Math.max(1, Math.round(retryAfterSec));
  if (seconds < 60) return `${seconds} segundo(s)`;
  return `${Math.ceil(seconds / 60)} minuto(s)`;
}

export function officialLaudoRateLimitMessage(retryAfterSec?: number | null): string {
  const wait =
    retryAfterSec && retryAfterSec > 0
      ? ` Tente novamente em cerca de ${formatRetryAfterWait(retryAfterSec)}.`
      : " Aguarde alguns minutos e tente novamente.";
  return `Não foi possível emitir o laudo agora: limite temporário de tentativas.${wait}`;
}

/**
 * O supabase-js só expõe "Edge Function returned a non-2xx status code"; a mensagem
 * real vem no corpo da resposta, que precisa ser lido de forma assíncrona.
 */
export async function getEdgeErrorMessage(error: unknown): Promise<string> {
  const response = edgeResponseFromError(error);
  if (response?.status === 429) {
    return officialLaudoRateLimitMessage(parseRetryAfterSeconds(response.headers.get("Retry-After")));
  }
  if (typeof response?.json === "function") {
    try {
      const payload = (await response.json()) as { error?: string; message?: string };
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
    const message = String(data.error);
    if (/muitas tentativas/i.test(message) || /too many requests/i.test(message)) {
      throw new AppError(officialLaudoRateLimitMessage());
    }
    throw new AppError(message);
  }
  if (!data) {
    throw new AppError("Resposta vazia da Edge Function");
  }
  return data;
}
