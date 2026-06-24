import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "@/app/router";
import { getMissingProductionEnvVars } from "@/lib/env";
import "@/styles/globals.css";

function renderConfigError(missing: string[]) {
  const root = document.getElementById("root");
  if (!root) return;

  root.innerHTML = `
    <div style="font-family: system-ui, sans-serif; max-width: 32rem; margin: 4rem auto; padding: 0 1.5rem; color: #0f172a;">
      <h1 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.75rem;">Configuração incompleta</h1>
      <p style="font-size: 0.875rem; line-height: 1.5; color: #475569; margin-bottom: 1rem;">
        O aplicativo não pôde iniciar porque as variáveis de ambiente do backend não estão definidas no deploy.
      </p>
      <ul style="font-size: 0.875rem; line-height: 1.6; color: #334155; margin: 0 0 1rem 1.25rem;">
        ${missing.map((name) => `<li><code>${name}</code></li>`).join("")}
      </ul>
      <p style="font-size: 0.8125rem; color: #64748b;">
        Configure-as no painel da Vercel (Settings → Environment Variables) e faça um novo deploy.
      </p>
    </div>
  `;
}

const missingEnv = import.meta.env.PROD ? getMissingProductionEnvVars() : [];

if (missingEnv.length > 0) {
  renderConfigError(missingEnv);
} else {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  );
}
