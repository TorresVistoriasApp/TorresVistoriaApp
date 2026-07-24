import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "@/app/router";
import { reloadOnceOnChunkLoadError, clearChunkReloadFlag } from "@/lib/chunk-load-recovery";
import { getMissingProductionEnvVars } from "@/lib/env";
import "@/styles/globals.css";

if (typeof window !== "undefined") {
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

function renderConfigError(missing: string[]) {
  const root = document.getElementById("root");
  if (!root) return;

  root.replaceChildren();

  const wrap = document.createElement("div");
  wrap.style.cssText =
    "font-family:system-ui,sans-serif;max-width:32rem;margin:4rem auto;padding:0 1.5rem;color:#0f172a";

  const title = document.createElement("h1");
  title.style.cssText = "font-size:1.25rem;font-weight:700;margin-bottom:0.75rem";
  title.textContent = "Configuração incompleta";

  const lead = document.createElement("p");
  lead.style.cssText = "font-size:0.875rem;line-height:1.5;color:#475569;margin-bottom:1rem";
  lead.textContent =
    "O aplicativo não pôde iniciar porque as variáveis de ambiente do backend não estão definidas no deploy.";

  const list = document.createElement("ul");
  list.style.cssText =
    "font-size:0.875rem;line-height:1.6;color:#334155;margin:0 0 1rem 1.25rem";
  for (const name of missing) {
    const item = document.createElement("li");
    const code = document.createElement("code");
    code.textContent = name;
    item.appendChild(code);
    list.appendChild(item);
  }

  const hint = document.createElement("p");
  hint.style.cssText = "font-size:0.8125rem;color:#64748b";
  hint.textContent =
    "Configure-as no painel da Vercel (Settings → Environment Variables) e faça um novo deploy.";

  wrap.append(title, lead, list, hint);
  root.appendChild(wrap);
}

const missingEnv = import.meta.env.PROD ? getMissingProductionEnvVars() : [];

if (missingEnv.length > 0) {
  renderConfigError(missingEnv);
} else {
  clearChunkReloadFlag();
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  );
}
