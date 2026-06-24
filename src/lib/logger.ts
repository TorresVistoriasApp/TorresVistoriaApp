import { isProduction } from "@/lib/env";

type LogLevel = "debug" | "info" | "warn" | "error";

const PII_PATTERN = /\b[\w.+-]+@[\w-]+\.\w{2,}\b|\b\d{3}\.?\d{3}\.?\d{3}-?\d{2}\b/g;

function redact(message: string): string {
  return message.replace(PII_PATTERN, "[redacted]");
}

function log(level: LogLevel, message: string, meta?: unknown): void {
  if (isProduction() && level === "debug") return;

  const safeMessage = isProduction() ? redact(message) : message;
  const payload = meta !== undefined ? (isProduction() ? "[meta]" : meta) : undefined;

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
