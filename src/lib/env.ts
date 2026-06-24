const DEV_PLACEHOLDER_URL = "http://127.0.0.1:54321";
const DEV_PLACEHOLDER_KEY = "dev-only-placeholder";

export function getApiUrl(): string | undefined {
  return import.meta.env.VITE_API_URL || import.meta.env.VITE_SUPABASE_URL || undefined;
}

export function getApiAnonKey(): string | undefined {
  return import.meta.env.VITE_API_ANON_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || undefined;
}

export function isBackendConfigured(): boolean {
  return Boolean(getApiUrl() && getApiAnonKey());
}

export function getMissingProductionEnvVars(): string[] {
  const missing: string[] = [];
  if (!getApiUrl()) missing.push("VITE_API_URL");
  if (!getApiAnonKey()) missing.push("VITE_API_ANON_KEY");
  return missing;
}

export function validateEnv(): void {
  if (!import.meta.env.PROD) return;

  const missing = getMissingProductionEnvVars();
  if (missing.length > 0) {
    throw new Error(`Variáveis obrigatórias ausentes: ${missing.join(", ")}`);
  }

  if (import.meta.env.VITE_DEMO_MODE === "true") {
    console.warn("[Torres] VITE_DEMO_MODE=true em produção — desative para deploy real.");
  }
}

export function getAppUrl(): string {
  return import.meta.env.VITE_APP_URL ?? window.location.origin;
}

export function isProduction(): boolean {
  return import.meta.env.PROD;
}

export function getApiOrigin(): string | undefined {
  const url = getApiUrl();
  if (!url) return undefined;

  try {
    return new URL(url).origin;
  } catch {
    return undefined;
  }
}

export function getDevBackendFallback(): { url: string; key: string } {
  return { url: DEV_PLACEHOLDER_URL, key: DEV_PLACEHOLDER_KEY };
}
