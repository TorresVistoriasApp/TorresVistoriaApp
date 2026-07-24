const DEFAULT_ORIGIN = Deno.env.get("SITE_URL") ?? Deno.env.get("VITE_APP_URL") ?? "";

const EXTRA_ORIGINS = (Deno.env.get("ALLOWED_ORIGINS") ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

function isAllowedOrigin(origin: string): boolean {
  if (!origin) return false;
  if (DEFAULT_ORIGIN && origin === DEFAULT_ORIGIN) return true;
  return EXTRA_ORIGINS.includes(origin);
}

/**
 * CORS refletido só para origens configuradas.
 * Sem SITE_URL/ALLOWED_ORIGINS, respostas autenticadas não liberam origem cruzada
 * (evita o fallback antigo para "*").
 */
export function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("Origin") ?? "";
  const allowOrigin = isAllowedOrigin(origin)
    ? origin
    : DEFAULT_ORIGIN || "null";

  return {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    Vary: "Origin",
  };
}
