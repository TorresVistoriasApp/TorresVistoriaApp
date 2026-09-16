import { isEnvFlagTrue } from "./env-flag.ts";

const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const SITEVERIFY_TIMEOUT_MS = 10_000;

export class TurnstileError extends Error {
  constructor(message = "Falha na verificação anti-bot. Atualize a página e tente novamente.") {
    super(message);
    this.name = "TurnstileError";
  }
}

export function isTurnstileRequired(): boolean {
  return isEnvFlagTrue(Deno.env.get("TURNSTILE_REQUIRED"));
}

/**
 * Verifica o token Cloudflare Turnstile (somente body `captchaToken`; headers ignorados).
 *
 * | Cenário | secret | TURNSTILE_REQUIRED | token | Resultado |
 * |---------|--------|--------------------|-------|-----------|
 * | A dev | ausente | false | qualquer | passa (no-op) |
 * | B | ausente | true | qualquer | TurnstileError |
 * | C | presente | true | ausente | TurnstileError |
 * | D | presente | * | inválido | TurnstileError |
 * | E | presente | * | válido (siteverify success) | passa |
 * | F–I | presente | * | * | HTTP≠2xx, JSON inválido, success≠true, timeout → TurnstileError |
 * | J secret inválido | presente | * | qualquer | siteverify success=false → TurnstileError |
 * | K flag ambígua | * | TRUE/1/yes/… | * | tratado como false (fail-open só se secret ausente) |
 *
 * Produção: secret + TURNSTILE_REQUIRED=true + token válido. Secret presente exige token mesmo com required=false.
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

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), SITEVERIFY_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(SITEVERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      signal: controller.signal,
    });
  } catch {
    throw new TurnstileError();
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) {
    throw new TurnstileError();
  }

  let payload: { success?: boolean };
  try {
    payload = (await res.json()) as { success?: boolean };
  } catch {
    throw new TurnstileError();
  }

  if (payload.success !== true) {
    throw new TurnstileError();
  }
}
