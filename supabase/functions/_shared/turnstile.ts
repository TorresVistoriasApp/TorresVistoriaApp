const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export class TurnstileError extends Error {
  constructor(message = "Falha na verificação anti-bot. Atualize a página e tente novamente.") {
    super(message);
    this.name = "TurnstileError";
  }
}

/**
 * Verifica o token do Cloudflare Turnstile.
 * Sem TURNSTILE_SECRET_KEY (dev local) a checagem é omitida — produção deve definir o secret.
 */
export async function verifyTurnstileToken(
  token: unknown,
  remoteIp?: string,
): Promise<void> {
  const secret = Deno.env.get("TURNSTILE_SECRET_KEY")?.trim();
  if (!secret) return;

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
