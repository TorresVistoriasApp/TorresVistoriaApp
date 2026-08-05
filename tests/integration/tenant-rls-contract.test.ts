import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const MIGRATIONS_DIR = path.resolve(process.cwd(), "supabase/migrations");
const RENAME_MIGRATION = "20260806170000_rename_company_id_to_tenant_id.sql";

function readMigration(fileName: string): string {
  return readFileSync(path.join(MIGRATIONS_DIR, fileName), "utf8");
}

function allMigrations(): string {
  return readdirSync(MIGRATIONS_DIR)
    .filter((name) => name.endsWith(".sql"))
    .sort()
    .map((name) => readFileSync(path.join(MIGRATIONS_DIR, name), "utf8"))
    .join("\n");
}

/**
 * Contrato estático de isolamento (complementa os testes pgTAP em supabase/tests).
 *
 * As asserções de conceito varrem todas as migrations, e as de vocabulário atual
 * olham a migration de rename. Amarrar o contrato ao texto de um arquivo
 * histórico específico é o que fazia este teste quebrar a cada renomeação: uma
 * migration aplicada é imutável, então ela descreve o passado, não o estado atual.
 */
describe("tenant RLS contract (migrations)", () => {
  it("define os predicados de acesso por tenant", () => {
    const sql = allMigrations();
    expect(sql).toContain("can_access_tenant_row");
    expect(sql).toContain("can_access_inspection_row");
    expect(sql).toContain("can_access_financial_row");
    expect(sql).toContain("p_created_by = auth.uid()");
    expect(sql).toContain("is_super_admin()");
    expect(sql).toContain("financial.read.own");
  });

  it("fecha bypass cross-tenant nos RPCs que recebem o tenant por parâmetro", () => {
    const sql = readMigration(RENAME_MIGRATION);
    expect(sql).toContain("get_user_tenant_id() IS DISTINCT FROM p_tenant_id");
    expect(sql).toContain("RAISE EXCEPTION 'Acesso negado'");

    // Todo RPC que aceita o tenant como argumento precisa validar contra a sessão.
    const rpcsWithTenantArg = [
      "get_dashboard_stats",
      "get_monthly_inspections",
      "get_inspections_by_brand",
      "get_financial_summary",
      "search_inspections",
    ];
    for (const rpc of rpcsWithTenantArg) {
      expect(sql).toContain(`public.${rpc}(`);
    }
  });

  it("storage valida o prefixo do tenant em fotos e laudos", () => {
    const sql = readMigration(RENAME_MIGRATION);
    expect(sql).toContain("validate_inspection_photo_storage_path");
    expect(sql).toContain("validate_inspection_report_storage_path");
    expect(sql).toContain("split_part(NEW.storage_path, '/', 1) <> NEW.tenant_id::text");

    const all = allMigrations();
    expect(all).toContain("is_canonical_inspection_photo_object_path");
    expect(all).toContain("is_canonical_report_object_path");
  });

  it("resolve o tenant da sessão por get_user_tenant_id", () => {
    const sql = readMigration(RENAME_MIGRATION);
    expect(sql).toContain("RENAME TO get_user_tenant_id");
    expect(sql).toContain("SELECT tenant_id\n  FROM public.profiles");
    expect(sql).toContain("AND is_active = true");
  });

  it("renomeia a coluna de tenant em todas as tabelas com tenant", () => {
    const sql = readMigration(RENAME_MIGRATION);
    expect(sql).toContain("RENAME COLUMN company_id TO tenant_id");

    const tenantTables = [
      "profiles",
      "settings",
      "inspections",
      "inspection_checklists",
      "inspection_photos",
      "inspection_comments",
      "inspection_reports",
      "inspection_paint_items",
      "inspection_types",
      "financial_entries",
      "notifications",
      "audit_logs",
      "photo_sections",
      "photo_categories",
      "company_subscriptions",
      "tenant_invitations",
      "company_branches",
      "company_teams",
      "company_team_members",
      "integration_connections",
      "company_custom_permissions",
    ];
    for (const table of tenantTables) {
      expect(sql).toContain(`'${table}'`);
    }
  });

  it("mantém RLS habilitado nas tabelas SaaS reservadas", () => {
    const sql = readMigration("20260805210000_saas_future_foundation.sql");
    const futureTables = [
      "company_subscriptions",
      "tenant_invitations",
      "company_branches",
      "company_teams",
      "integration_connections",
      "company_custom_permissions",
    ];
    for (const table of futureTables) {
      expect(sql).toContain(`public.${table}`);
      expect(sql).toContain("ENABLE ROW LEVEL SECURITY");
    }
    expect(sql).toContain("feature_flags");
  });
});
