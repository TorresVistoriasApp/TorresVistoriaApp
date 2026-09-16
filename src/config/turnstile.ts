import { isEnvFlagTrue } from "@/shared/lib/env-flag";

export function getTurnstileSiteKey(): string | undefined {
  const key = import.meta.env.VITE_TURNSTILE_SITE_KEY?.trim();
  return key || undefined;
}

/**
 * Fail-closed no frontend quando a produção exige Turnstile.
 * Sem site key + flag ligada, o submit é recusado (não segue sem captcha).
 * Só `VITE_TURNSTILE_REQUIRED=true` literal liga (TRUE/1/yes não contam).
 */
export function isTurnstileRequired(): boolean {
  return isEnvFlagTrue(import.meta.env.VITE_TURNSTILE_REQUIRED);
}

/** Widget quando há site key. Obrigatório também se VITE_TURNSTILE_REQUIRED=true. */
export function isTurnstileEnabled(): boolean {
  return Boolean(getTurnstileSiteKey()) || isTurnstileRequired();
}
