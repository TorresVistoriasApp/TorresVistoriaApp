type SyncLogLevel = "info" | "warn" | "error";

export type SyncLogEntry = {
  timestamp: string;
  level: SyncLogLevel;
  message: string;
  context?: Record<string, unknown>;
};

const MAX_LOGS = 100;
const logs: SyncLogEntry[] = [];

function pushLog(level: SyncLogLevel, message: string, context?: Record<string, unknown>) {
  const entry: SyncLogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    context,
  };
  logs.unshift(entry);
  if (logs.length > MAX_LOGS) logs.pop();

  if (import.meta.env.DEV) {
    const fn = level === "error" ? console.error : level === "warn" ? console.warn : console.info;
    fn(`[sync] ${message}`, context ?? "");
  }
}

export const syncLogger = {
  info: (message: string, context?: Record<string, unknown>) => pushLog("info", message, context),
  warn: (message: string, context?: Record<string, unknown>) => pushLog("warn", message, context),
  error: (message: string, context?: Record<string, unknown>) => pushLog("error", message, context),
  getRecent: (limit = 20) => logs.slice(0, limit),
};
