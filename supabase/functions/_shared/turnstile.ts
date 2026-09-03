const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export class TurnstileError extends Error {
  constructor(message = "Falha na verificação anti-bot. Atualize a página e tente novamente.") {
    super(message);
    this.name = "TurnstileError";
  }
}

function isTurnstileRequired(): boolean {
  return Deno.env.get("TURNSTILE_REQUIRED")?.trim() === "true";
}

/**
 * Verifica o token do Cloudflare Turnstile.
 * Dev e produção sem TURNSTILE_REQUIRED omitem a checagem se o secret faltar.
 * Com TURNSTILE_REQUIRED=true (depois de configurar o secret) falha fechada.
 */
export async function verifyTurnstileToken(
  token: unknown,
  remoteIp?: string,
): Promise<void> {
  const secret = Deno.env.get("TURNSTILE_SECRET_KEY")?.trim();
  if (!secret) {
    if (isTurnstileRequired()) {
      throw new TurnstileError("Verificação anti-bot obrigatória.");
    }
    return;
  }

  const response = typeof token === "string" ? token.trim() : "";
  if (!response) {
    throw new TurnstileError("Verificação anti-bot obrigatória.");
  }

  const body = new URLSearchParams();
  body.set("secret", secret);
  body.set("response", response);
  if (remoteIp && remoteIp !== "unknown") {
    body.set("remoteip", remoteIp);
  }

  const res = await fetch(SITEVERIFY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) {
    throw new TurnstileError();
  }

  const payload = (await res.json()) as { success?: boolean };
  if (payload.success !== true) {
    throw new TurnstileError();
  }
}
