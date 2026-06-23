export class AppError extends Error {
  readonly code?: string;

  constructor(message: string, code?: string) {
    super(message);
    this.name = "AppError";
    this.code = code;
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) return error.message;
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: unknown }).message);
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

export function throwIfEdgeError<T extends Record<string, unknown>>(
  error: unknown,
  data: T | null,
): T {
  if (error) {
    throw new AppError(getErrorMessage(error));
  }
  if (data && "error" in data && data.error) {
    throw new AppError(String(data.error));
  }
  if (!data) {
    throw new AppError("Resposta vazia da Edge Function");
  }
  return data;
}
