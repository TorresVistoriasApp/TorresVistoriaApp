export const LGPD_CONSENT_KEY = "torres-lgpd-consent-v1";
export const LGPD_CONSENT_VERSION = "1.0";

export type LgpdConsent = {
  version: string;
  acceptedAt: string;
  analytics: boolean;
  essential: true;
};

export function readLgpdConsent(): LgpdConsent | null {
  try {
    const raw = localStorage.getItem(LGPD_CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LgpdConsent;
    if (parsed.version !== LGPD_CONSENT_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function saveLgpdConsent(analytics: boolean): LgpdConsent {
  const consent: LgpdConsent = {
    version: LGPD_CONSENT_VERSION,
    acceptedAt: new Date().toISOString(),
    analytics,
    essential: true,
  };
  localStorage.setItem(LGPD_CONSENT_KEY, JSON.stringify(consent));
  return consent;
}

export function clearLgpdConsent(): void {
  localStorage.removeItem(LGPD_CONSENT_KEY);
}
