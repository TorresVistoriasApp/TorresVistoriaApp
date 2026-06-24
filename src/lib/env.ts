const REQUIRED_IN_PROD = ["VITE_API_URL", "VITE_API_ANON_KEY"] as const;

export function validateEnv(): void {
  if (!import.meta.env.PROD) return;

  const missing = REQUIRED_IN_PROD.filter((key) => !import.meta.env[key]);
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
  const url = import.meta.env.VITE_API_URL;
  if (!url) return undefined;

  try {
    return new URL(url).origin;
  } catch {
    return undefined;
  }
}
