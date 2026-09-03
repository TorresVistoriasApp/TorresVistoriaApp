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

const PRODUCTION_ORIGINS = new Set([
  "https://torresconsultas.com.br",
  "https://www.torresconsultas.com.br",
  "https://vistoria.torresconsultas.com.br",
  "https://torres-vistoria-app.vercel.app",
]);

function isHttpsProductionSite(): boolean {
  if (!DEFAULT_ORIGIN.startsWith("https://")) return false;
  try {
    const host = new URL(DEFAULT_ORIGIN).hostname;
    return host !== "localhost" && host !== "127.0.0.1";
  } catch {
    return true;
  }
}

export function isAllowedOrigin(origin: string): boolean {
  if (!origin) return false;
  if (DEFAULT_ORIGIN && origin === DEFAULT_ORIGIN) return true;
  if (EXTRA_ORIGINS.includes(origin)) return true;
  if (PRODUCTION_ORIGINS.has(origin)) return true;
  if (!isHttpsProductionSite() && LOCAL_ORIGINS.has(origin)) return true;
  return false;
}

/**
 * Origem da aplicação para redirects/QR. Nunca usa Origin cru:
 * só devolve o header se ele já passou na allowlist; senão SITE_URL.
 */
export function canonicalAppOrigin(req: Request): string {
  const origin = req.headers.get("Origin") ?? "";
  if (isAllowedOrigin(origin)) return origin.replace(/\/$/, "");
  return (DEFAULT_ORIGIN || "https://www.torresconsultas.com.br").replace(/\/$/, "");
}

/**
 * CORS refletido só para origens conhecidas.
 * Não usa "*" nem curingas de preview da Vercel — cada preview entra em ALLOWED_ORIGINS.
 * Sem match, responde "null" e o browser bloqueia a leitura.
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

/** OPTIONS passa; qualquer outro método que não seja POST devolve 405. */
export function rejectNonPost(
  req: Request,
  corsHeaders: Record<string, string>,
): Response | null {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Método não permitido." }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        Allow: "POST, OPTIONS",
      },
      status: 405,
    });
  }
  return null;
}
