export function getTurnstileSiteKey(): string | undefined {
  const key = import.meta.env.VITE_TURNSTILE_SITE_KEY?.trim();
  return key || undefined;
}

/** Widget e token só quando a site key existe. Sem chave, o login não quebra. */
export function isTurnstileEnabled(): boolean {
  return Boolean(getTurnstileSiteKey());
}
