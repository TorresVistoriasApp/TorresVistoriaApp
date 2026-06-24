const DEFAULT_ORIGIN = Deno.env.get("SITE_URL") ?? Deno.env.get("VITE_APP_URL") ?? "";

export function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("Origin") ?? "";
  const allowed =
    !DEFAULT_ORIGIN ||
    origin === DEFAULT_ORIGIN ||
    origin.endsWith(".vercel.app");

  return {
    "Access-Control-Allow-Origin": allowed && origin ? origin : DEFAULT_ORIGIN || "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Vary": "Origin",
  };
}

/** @deprecated use getCorsHeaders(req) */
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};
