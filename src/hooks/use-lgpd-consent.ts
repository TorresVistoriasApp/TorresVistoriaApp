import { useCallback, useSyncExternalStore } from "react";
import { readLgpdConsent, saveLgpdConsent, type LgpdConsent } from "@/lib/lgpd";

function subscribe(callback: () => void): () => void {
  const handler = () => callback();
  window.addEventListener("storage", handler);
  window.addEventListener("lgpd-consent-change", handler);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener("lgpd-consent-change", handler);
  };
}

function getSnapshot(): LgpdConsent | null {
  return readLgpdConsent();
}

export function useLgpdConsent() {
  const consent = useSyncExternalStore(subscribe, getSnapshot, () => null);

  const accept = useCallback((analytics = false) => {
    saveLgpdConsent(analytics);
    window.dispatchEvent(new Event("lgpd-consent-change"));
  }, []);

  return { consent, hasConsent: consent !== null, accept };
}
