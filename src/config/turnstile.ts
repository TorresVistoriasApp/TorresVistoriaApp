export function getTurnstileSiteKey(): string | undefined {
  const key = import.meta.env.VITE_TURNSTILE_SITE_KEY?.trim();
  return key || undefined;
}

/**
 * Fail-closed no frontend quando a produção exige Turnstile.
 * Sem site key + flag ligada, o submit é recusado (não segue sem captcha).
 */
export function isTurnstileRequired(): boolean {
  return import.meta.env.VITE_TURNSTILE_REQUIRED?.trim() === "true";
}

/** Widget quando há site key. Obrigatório também se VITE_TURNSTILE_REQUIRED=true. */
export function isTurnstileEnabled(): boolean {
  return Boolean(getTurnstileSiteKey()) || isTurnstileRequired();
}
