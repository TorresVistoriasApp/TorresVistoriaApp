import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function write(rel, content) {
  const full = join(root, rel);
  mkdirSync(dirname(full), { recursive: true });
  if (!existsSync(full)) {
    writeFileSync(full, content, "utf8");
    return true;
  }
  return false;
}

function forceWrite(rel, content) {
  const full = join(root, rel);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, content, "utf8");
}

const stubComponent = (name, exportName = name) =>
  `/** Scaffold — implementar na Fase 1 */\nexport function ${exportName}() {\n  return null;\n}\n`;

const stubPage = (title) =>
  `/** Scaffold — ${title} */\nexport function Page() {\n  return (\n    <div className="p-4">\n      <h1 className="text-2xl font-bold">${title}</h1>\n      <p className="text-muted-foreground text-sm">Em implementação — Fase 1</p>\n    </div>\n  );\n}\n`;

const stubHook = (name) =>
  `/** Scaffold — implementar na Fase 1 */\nexport function ${name}() {\n  throw new Error("${name} não implementado");\n}\n`;

const stubService = (name) =>
  `/** Scaffold — implementar na Fase 1 */\nexport const ${name} = {\n  // TODO\n} as const;\n`;

const stubSchema = (name) =>
  `import { z } from "zod";\n\n/** Scaffold — implementar na Fase 1 */\nexport const ${name}Schema = z.object({});\nexport type ${name.charAt(0).toUpperCase() + name.slice(1)}Input = z.infer<typeof ${name}Schema>;\n`;

const stubStore = (name, hook) =>
  `import { create } from "zustand";\n\ninterface ${name}State {\n  // TODO\n}\n\nexport const use${hook} = create<${name}State>(() => ({}));\n`;

const pages = [
  ["src/app/(auth)/layout.tsx", `import { Outlet } from "react-router-dom";\n\nexport function AuthLayout() {\n  return (\n    <div className="min-h-dvh bg-muted/40">\n      <Outlet />\n    </div>\n  );\n}\n`],
  ["src/app/(auth)/login/page.tsx", stubPage("Login")],
  ["src/app/(auth)/recuperar-senha/page.tsx", stubPage("Recuperar senha")],
  ["src/app/(auth)/redefinir-senha/page.tsx", stubPage("Redefinir senha")],
  ["src/app/(dashboard)/layout.tsx", `import { Outlet } from "react-router-dom";\nimport { AppShell } from "@/components/layout/app-shell";\n\nexport function DashboardLayout() {\n  return (\n    <AppShell>\n      <Outlet />\n    </AppShell>\n  );\n}\n`],
  ["src/app/(dashboard)/page.tsx", stubPage("Dashboard")],
  ["src/app/(dashboard)/vistorias/page.tsx", stubPage("Vistorias")],
  ["src/app/(dashboard)/vistorias/nova/page.tsx", stubPage("Nova vistoria")],
  ["src/app/(dashboard)/vistorias/[id]/page.tsx", stubPage("Detalhe da vistoria")],
  ["src/app/(dashboard)/vistorias/[id]/editar/page.tsx", stubPage("Editar vistoria")],
  ["src/app/(dashboard)/vistorias/[id]/fotos/page.tsx", stubPage("Fotos da vistoria")],
  ["src/app/(dashboard)/vistorias/[id]/checklist/page.tsx", stubPage("Checklist")],
  ["src/app/(dashboard)/vistorias/[id]/laudo/page.tsx", stubPage("Laudo PDF")],
  ["src/app/(dashboard)/financeiro/page.tsx", stubPage("Financeiro")],
  ["src/app/(dashboard)/financeiro/receitas/page.tsx", stubPage("Receitas")],
  ["src/app/(dashboard)/financeiro/despesas/page.tsx", stubPage("Despesas")],
  ["src/app/(dashboard)/relatorios/page.tsx", stubPage("Relatórios")],
  ["src/app/(dashboard)/configuracoes/page.tsx", stubPage("Configurações")],
  ["src/app/(dashboard)/configuracoes/empresa/page.tsx", stubPage("Empresa")],
  ["src/app/(dashboard)/configuracoes/perfil/page.tsx", stubPage("Perfil")],
  ["src/app/(dashboard)/usuarios/page.tsx", stubPage("Usuários")],
  ["src/app/(dashboard)/auditoria/page.tsx", stubPage("Auditoria")],
];

const components = [
  ["src/components/layout/app-shell.tsx", stubComponent("AppShell")],
  ["src/components/layout/sidebar.tsx", stubComponent("Sidebar")],
  ["src/components/layout/mobile-nav.tsx", stubComponent("MobileNav")],
  ["src/components/layout/header.tsx", stubComponent("Header")],
  ["src/components/layout/footer.tsx", stubComponent("Footer")],
  ["src/components/forms/vistoria-form.tsx", stubComponent("VistoriaForm")],
  ["src/components/forms/cliente-form.tsx", stubComponent("ClienteForm")],
  ["src/components/forms/veiculo-form.tsx", stubComponent("VeiculoForm")],
  ["src/components/forms/checklist-form.tsx", stubComponent("ChecklistForm")],
  ["src/components/forms/financial-entry-form.tsx", stubComponent("FinancialEntryForm")],
  ["src/components/forms/user-form.tsx", stubComponent("UserForm")],
  ["src/components/vistoria/vistoria-card.tsx", stubComponent("VistoriaCard")],
  ["src/components/vistoria/vistoria-list.tsx", stubComponent("VistoriaList")],
  ["src/components/vistoria/vistoria-status-badge.tsx", stubComponent("VistoriaStatusBadge")],
  ["src/components/vistoria/vistoria-filters.tsx", stubComponent("VistoriaFilters")],
  ["src/components/checklist/checklist-category.tsx", stubComponent("ChecklistCategory")],
  ["src/components/checklist/checklist-item.tsx", stubComponent("ChecklistItem")],
  ["src/components/checklist/checklist-summary.tsx", stubComponent("ChecklistSummary")],
  ["src/components/photos/photo-upload.tsx", stubComponent("PhotoUpload")],
  ["src/components/photos/photo-gallery.tsx", stubComponent("PhotoGallery")],
  ["src/components/photos/photo-preview.tsx", stubComponent("PhotoPreview")],
  ["src/components/photos/photo-categories.tsx", stubComponent("PhotoCategories")],
  ["src/components/pdf/pdf-preview.tsx", stubComponent("PdfPreview")],
  ["src/components/pdf/pdf-download-button.tsx", stubComponent("PdfDownloadButton")],
  ["src/components/pdf/laudo-template.tsx", stubComponent("LaudoTemplate")],
  ["src/components/charts/revenue-chart.tsx", stubComponent("RevenueChart")],
  ["src/components/charts/inspections-chart.tsx", stubComponent("InspectionsChart")],
  ["src/components/charts/kpi-card.tsx", stubComponent("KpiCard")],
  ["src/components/charts/chart-wrapper.tsx", stubComponent("ChartWrapper")],
  ["src/components/dashboard/stats-grid.tsx", stubComponent("StatsGrid")],
  ["src/components/dashboard/recent-inspections.tsx", stubComponent("RecentInspections")],
  ["src/components/dashboard/monthly-overview.tsx", stubComponent("MonthlyOverview")],
  ["src/components/shared/loading-spinner.tsx", stubComponent("LoadingSpinner")],
  ["src/components/shared/error-boundary.tsx", stubComponent("ErrorBoundary")],
  ["src/components/shared/empty-state.tsx", stubComponent("EmptyState")],
  ["src/components/shared/confirm-dialog.tsx", stubComponent("ConfirmDialog")],
  ["src/components/shared/data-table.tsx", stubComponent("DataTable")],
  ["src/components/shared/search-input.tsx", stubComponent("SearchInput")],
  ["src/components/shared/mobile-back-button.tsx", stubComponent("MobileBackButton")],
];

const hooks = [
  "use-user", "use-inspections", "use-inspection", "use-checklist",
  "use-photos", "use-financial", "use-dashboard", "use-mobile",
  "use-toast", "use-local-storage",
].map((n) => [`src/hooks/${n}.ts`, stubHook(n.split("-").map((p, i) => i ? p.charAt(0).toUpperCase() + p.slice(1) : p).join(""))]);

const schemas = [
  "auth", "vistoria", "cliente", "veiculo", "checklist", "photo", "financial", "user", "settings",
].map((n) => [`src/schemas/${n}.ts`, stubSchema(n)]);

const services = [
  "authService", "inspectionService", "checklistService", "photoService",
  "pdfService", "financialService", "reportService", "userService", "companyService",
].map((n) => [`src/services/${n.replace("Service", "-service")}.ts`, stubService(n)]);

const stores = [
  ["src/stores/auth-store.ts", stubStore("Auth", "AuthStore")],
  ["src/stores/ui-store.ts", stubStore("Ui", "UiStore")],
  ["src/stores/inspection-store.ts", stubStore("Inspection", "InspectionStore")],
];

const edgeFunctions = [
  ["supabase/functions/_shared/cors.ts", `export const corsHeaders = {\n  "Access-Control-Allow-Origin": "*",\n  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",\n};\n`],
  ["supabase/functions/_shared/supabase-client.ts", `/** Scaffold — Edge Function Supabase client */\nimport { createClient } from "https://esm.sh/@supabase/supabase-js@2";\n\nexport function createServiceClient() {\n  return createClient(\n    Deno.env.get("SUPABASE_URL") ?? "",\n    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",\n  );\n}\n`],
  ["supabase/functions/generate-pdf/index.ts", `import { corsHeaders } from "../_shared/cors.ts";\n\nDeno.serve(async (req) => {\n  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });\n  return new Response(JSON.stringify({ ok: true, message: "generate-pdf scaffold" }), {\n    headers: { ...corsHeaders, "Content-Type": "application/json" },\n  });\n});\n`],
  ["supabase/functions/compress-image/index.ts", `import { corsHeaders } from "../_shared/cors.ts";\n\nDeno.serve(async (req) => {\n  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });\n  return new Response(JSON.stringify({ ok: true, message: "compress-image scaffold" }), {\n    headers: { ...corsHeaders, "Content-Type": "application/json" },\n  });\n});\n`],
  ["supabase/functions/create-report/index.ts", `import { corsHeaders } from "../_shared/cors.ts";\n\nDeno.serve(async (req) => {\n  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });\n  return new Response(JSON.stringify({ ok: true, message: "create-report scaffold" }), {\n    headers: { ...corsHeaders, "Content-Type": "application/json" },\n  });\n});\n`],
];

const docs = [
  ["docs/api.md", "# API\n\nScaffold — documentar Edge Functions e endpoints na Fase 1.\n"],
  ["docs/database.md", "# Database\n\nVer `supabase/migrations/` e `docs/ARQUITETURA.md`.\n"],
  ["docs/setup.md", "# Setup\n\n```bash\nnpm install\ncp .env.example .env.local\nnpm run dev\n```\n"],
  ["docs/architecture.md", "# Architecture\n\nVer [ARQUITETURA.md](./ARQUITETURA.md).\n"],
];

const tests = [
  "tests/unit/schemas/.gitkeep",
  "tests/unit/services/.gitkeep",
  "tests/unit/utils/.gitkeep",
  "tests/integration/.gitkeep",
  "tests/e2e/.gitkeep",
].map((p) => [p, ""]);

let created = 0;
for (const batch of [pages, components, hooks, schemas, services, stores, edgeFunctions, docs, tests]) {
  for (const [path, content] of batch) {
    if (write(path, content)) created++;
  }
}

console.log(`Scaffold: ${created} arquivos criados`);
