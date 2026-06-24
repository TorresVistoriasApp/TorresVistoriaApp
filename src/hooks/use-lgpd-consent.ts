import { useCallback, useMemo, useSyncExternalStore } from "react";
import { LGPD_CONSENT_KEY, readLgpdConsent, saveLgpdConsent, type LgpdConsent } from "@/lib/lgpd";

function subscribe(callback: () => void): () => void {
  const handler = () => callback();
  window.addEventListener("storage", handler);
  window.addEventListener("lgpd-consent-change", handler);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener("lgpd-consent-change", handler);
  };
}

/** Snapshot primitivo — evita loop infinito (Object.is falha com objetos novos a cada parse). */
function getSnapshot(): string | null {
  return localStorage.getItem(LGPD_CONSENT_KEY);
}

export function useLgpdConsent() {
  const raw = useSyncExternalStore(subscribe, getSnapshot, () => null);

  const consent = useMemo((): LgpdConsent | null => {
    if (raw === null) return null;
    return readLgpdConsent();
  }, [raw]);

  const accept = useCallback((analytics = false) => {
    saveLgpdConsent(analytics);
    window.dispatchEvent(new Event("lgpd-consent-change"));
  }, []);

  return { consent, hasConsent: raw !== null, accept };
}
