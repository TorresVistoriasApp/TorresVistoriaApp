const DEFAULT_ORIGIN = Deno.env.get("SITE_URL") ?? Deno.env.get("VITE_APP_URL") ?? "";

const EXTRA_ORIGINS = (Deno.env.get("ALLOWED_ORIGINS") ?? "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

/** Dev local — Vite usa 3000/5173 conforme o projeto. */
const LOCAL_ORIGINS = new Set([
  "http://localhost:3000",
  "http://localhost:5173",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5173",
]);

/**
 * Enquanto não houver domínio próprio, deploys na Vercel (*.vercel.app) são
 * aceitos. Quando SITE_URL estiver definido, ele continua valendo normalmente.
 */
function isVercelAppOrigin(origin: string): boolean {
  try {
    const url = new URL(origin);
    return url.protocol === "https:" && url.hostname.endsWith(".vercel.app");
  } catch {
    return false;
  }
}

function isAllowedOrigin(origin: string): boolean {
  if (!origin) return false;
  if (DEFAULT_ORIGIN && origin === DEFAULT_ORIGIN) return true;
  if (EXTRA_ORIGINS.includes(origin)) return true;
  if (LOCAL_ORIGINS.has(origin)) return true;
  if (isVercelAppOrigin(origin)) return true;
  return false;
}

/**
 * CORS refletido só para origens conhecidas.
 * Não usa "*" — sem match, responde "null" e o browser bloqueia a leitura.
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
