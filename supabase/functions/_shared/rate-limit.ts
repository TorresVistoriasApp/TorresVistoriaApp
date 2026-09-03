import type { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.49.8";

type Bucket = { count: number; resetAt: number };

/** Limite por isolate — complementar ao bucket persistente no Postgres. */
const buckets = new Map<string, Bucket>();

export type RateLimitResult = { allowed: boolean; retryAfterSec: number };

export function checkRateLimit(
  key: string,
  maxAttempts: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now >= bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSec: 0 };
  }

  if (bucket.count >= maxAttempts) {
    return {
      allowed: false,
      retryAfterSec: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }

  bucket.count += 1;
  return { allowed: true, retryAfterSec: 0 };
}

export function clientKey(req: Request): string {
  const cf = req.headers.get("cf-connecting-ip")?.trim();
  if (cf) return cf;
  const realIp = req.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  // Último hop: o primeiro IP de XFF é forjável pelo cliente.
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const parts = forwarded.split(",").map((part) => part.trim()).filter(Boolean);
    const last = parts[parts.length - 1];
    if (last) return last;
  }
  return "unknown";
}

type RateLimitRow = { allowed?: boolean; retry_after_seconds?: number };

/**
 * Rate limit compartilhado entre isolates (Postgres).
 * Falha fechada: se o RPC não responder, bloqueia a requisição.
 */
export async function consumePersistentRateLimit(
  supabase: SupabaseClient,
  key: string,
  maxAttempts: number,
  windowSeconds: number,
): Promise<RateLimitResult> {
  const { data, error } = await supabase.rpc("consume_rate_limit", {
    p_key: key,
    p_max: maxAttempts,
    p_window_seconds: windowSeconds,
  });

  if (error || !data || typeof data !== "object") {
    return { allowed: false, retryAfterSec: 30 };
  }

  const row = data as RateLimitRow;
  const retry = Number(row.retry_after_seconds ?? 0);
  return {
    allowed: row.allowed === true,
    retryAfterSec: Number.isFinite(retry) ? Math.max(0, retry) : 30,
  };
}

export function rateLimitedResponse(
  corsHeaders: Record<string, string>,
  retryAfterSec: number,
  message = "Muitas tentativas. Aguarde e tente novamente.",
): Response {
  return new Response(JSON.stringify({ error: message }), {
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
      "Retry-After": String(Math.max(1, retryAfterSec)),
    },
    status: 429,
  });
}
