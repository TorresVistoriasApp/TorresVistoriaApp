import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const MIGRATIONS_DIR = path.resolve(process.cwd(), "supabase/migrations");

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
 * Contrato estático: garante que migrations críticas de isolamento existem
 * e contêm os padrões esperados (complementa testes pgTAP em supabase/tests).
 */
describe("tenant RLS contract (migrations)", () => {
  it("define can_access_tenant_row com company_id e created_by", () => {
    const sql = readMigration("20260805160000_rls_inspector_created_by_scope.sql");
    expect(sql).toContain("can_access_tenant_row");
    expect(sql).toContain("get_user_company_id()");
    expect(sql).toContain("p_created_by = auth.uid()");
    expect(sql).toContain("is_super_admin()");
  });

  it("fecha bypass cross-tenant em RPCs de dashboard", () => {
    const sql = readMigration("20260805120000_fix_cross_tenant_rpc_bypass.sql");
    expect(sql).toContain("get_user_company_id() IS DISTINCT FROM p_company_id");
    expect(sql).toContain("RAISE EXCEPTION 'Acesso negado'");
  });

  it("financeiro do inspector usa can_access_financial_row", () => {
    const sql = readMigration("20260805180000_financial_inspector_scope.sql");
    expect(sql).toContain("can_access_financial_row");
    expect(sql).toContain("financial.read.own");
  });

  it("storage valida prefixo company_id em fotos e laudos", () => {
    const sql = readMigration("20260805170000_storage_canonical_paths.sql");
    expect(sql).toContain("validate_inspection_photo_storage_path");
    expect(sql).toContain("split_part(NEW.storage_path, '/', 1) <> NEW.company_id::text");
    expect(sql).toContain("validate_inspection_report_storage_path");
    expect(sql).toContain("is_canonical_inspection_photo_object_path");
    expect(sql).toContain("is_canonical_report_object_path");
  });

  it("políticas RLS principais referenciam get_user_company_id", () => {
    const sql = allMigrations();
    const tables = [
      "inspections",
      "inspection_photos",
      "financial_entries",
      "profiles",
      "audit_logs",
    ];
    for (const table of tables) {
      expect(sql).toMatch(new RegExp(`ON public\\.${table}`, "i"));
      expect(sql).toContain("get_user_company_id()");
    }
  });

  it("migration SaaS futura define tabelas reservadas com RLS", () => {
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
      expect(sql).toContain(`ENABLE ROW LEVEL SECURITY`);
    }
    expect(sql).toContain("feature_flags");
  });
});
