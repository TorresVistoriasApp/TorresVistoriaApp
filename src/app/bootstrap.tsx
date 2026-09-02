import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";
import { App } from "@/app/app";
import { renderConfigError } from "@/app/config-error-screen";
import { getMissingProductionEnvVars, validateEnv } from "@/config/env";
import { bootstrapIntegrations } from "@/infra/integrations/bootstrap";
import { clearChunkReloadFlag, reloadOnceOnChunkLoadError } from "@/shared/lib/chunk-load-recovery";
import "@/styles/globals.css";

/**
 * Um deploy novo apaga os chunks antigos; uma aba aberta desde antes tenta
 * baixá-los e quebra. Recarregar uma única vez resolve sem loop de reload.
 */
function installChunkRecovery() {
  window.addEventListener("vite:preloadError", (event) => {
    event.preventDefault();
    reloadOnceOnChunkLoadError(event.payload);
  });

  window.addEventListener("unhandledrejection", (event) => {
    if (reloadOnceOnChunkLoadError(event.reason)) {
      event.preventDefault();
    }
  });
}

export function bootstrap() {
  if (typeof window !== "undefined") {
    installChunkRecovery();
  }

  const missingEnv = import.meta.env.PROD ? getMissingProductionEnvVars() : [];
  if (missingEnv.length > 0) {
    renderConfigError(missingEnv);
    return;
  }

  validateEnv();
  bootstrapIntegrations();
  clearChunkReloadFlag();

  if (import.meta.env.PROD) {
    registerSW({
      immediate: true,
      onOfflineReady() {
        // PWA pronto para uso offline.
      },
    });
  }

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
