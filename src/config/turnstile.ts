export function getTurnstileSiteKey(): string | undefined {
  const key = import.meta.env.VITE_TURNSTILE_SITE_KEY?.trim();
  return key || undefined;
}

export function isTurnstileEnabled(): boolean {
  return Boolean(getTurnstileSiteKey());
}
