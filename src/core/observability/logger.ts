type LogLevel = "debug" | "info" | "warn" | "error";

const EMAIL = /\b[\w.+-]+@[\w-]+\.\w{2,}\b/gi;
const CPF = /\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g;
const CNPJ = /\b\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}\b/g;
const JWT = /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g;

export function redactPii(value: string): string {
  return value
    .replace(EMAIL, "[redacted-email]")
    .replace(CNPJ, "[redacted-cnpj]")
    .replace(CPF, "[redacted-cpf]")
    .replace(JWT, "[redacted-token]");
}

export function redactLogMeta(meta: unknown): unknown {
  if (meta === null || meta === undefined) return meta;
  if (typeof meta === "string") return redactPii(meta);
  if (typeof meta === "number" || typeof meta === "boolean") return meta;
  if (meta instanceof Error) {
    return { name: meta.name, message: redactPii(meta.message) };
  }
  if (Array.isArray(meta)) return meta.map(redactLogMeta);
  if (typeof meta === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(meta as Record<string, unknown>)) {
      if (
        /email|document|cpf|cnpj|password|token|jwt|phone|secret|chassis|chassi|plate|placa|renavam|service_role|access_token|refresh_token/i.test(
          key,
        )
      ) {
        out[key] = "[redacted]";
        continue;
      }
      out[key] = redactLogMeta(nested);
    }
    return out;
  }
  return "[redacted]";
}

function log(level: LogLevel, message: string, meta?: unknown): void {
  if (import.meta.env.PROD && level === "debug") return;

  const safeMessage = redactPii(message);
  const payload = meta !== undefined ? redactLogMeta(meta) : undefined;

  switch (level) {
    case "debug":
      console.debug(safeMessage, payload);
      break;
    case "info":
      console.info(safeMessage, payload);
      break;
    case "warn":
      console.warn(safeMessage, payload);
      break;
    case "error":
      console.error(safeMessage, payload);
      break;
  }
}

export const logger = {
  debug: (message: string, meta?: unknown) => log("debug", message, meta),
  info: (message: string, meta?: unknown) => log("info", message, meta),
  warn: (message: string, meta?: unknown) => log("warn", message, meta),
  error: (message: string, meta?: unknown) => log("error", message, meta),
};
