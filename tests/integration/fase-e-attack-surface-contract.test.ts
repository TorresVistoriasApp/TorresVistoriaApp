import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

function readRepo(relativePath: string): string {
  return readFileSync(path.resolve(process.cwd(), relativePath), "utf8");
}

function allMigrations(): string {
  const dir = path.resolve(process.cwd(), "supabase/migrations");
  return readdirSync(dir)
    .filter((name) => name.endsWith(".sql"))
    .sort()
    .map((name) => readFileSync(path.join(dir, name), "utf8"))
    .join("\n");
}

describe("Fase E — isolamento multi-tenant e IDOR", () => {
  it("Tenant A não lê Tenant B: predicados exigem get_user_tenant_id", () => {
    const sql = allMigrations();
    expect(sql).toContain("can_access_tenant_row");
    expect(sql).toContain("p_company_id = public.get_user_tenant_id()");
    expect(sql).toContain("can_access_inspection_row");
  });

  it("SUPER_ADMIN não troca tenant_id no self-update", () => {
    const sql = readRepo(
      "supabase/migrations/20260902120000_fase_a_document_hmac_and_tenant_lock.sql",
    );
    const fn = sql.slice(
      sql.indexOf("CREATE OR REPLACE FUNCTION public.prevent_profile_self_escalation()"),
      sql.indexOf("REVOKE ALL ON FUNCTION public.prevent_profile_self_escalation()"),
    );
    expect(fn).toContain("NEW.tenant_id IS DISTINCT FROM OLD.tenant_id");
    expect(fn).not.toMatch(/IF public\.is_super_admin\(\) THEN\s+RETURN NEW;/);
  });

  it("anonimização cross-tenant exige o mesmo tenant", () => {
    const sql = allMigrations();
    expect(sql).toContain("get_user_tenant_id() IS NOT DISTINCT FROM v_tenant_id");
  });

  it("vistoriador só acessa a própria vistoria (created_by = auth.uid)", () => {
    const sql = allMigrations();
    expect(sql).toContain("p_created_by = auth.uid()");
    expect(sql).toContain("public.is_inspector()");
  });

  it("consumidor só lê a própria consulta", () => {
    const sql = allMigrations();
    expect(sql).toContain("consumer_consultas_select_self");
    expect(sql).toContain("consumer_id = auth.uid()");
  });
});

describe("Fase E — JWT, papel e payload", () => {
  it("Edges autenticadas validam o usuário pelo JWT e leem role/tenant do banco", () => {
    const caller = readRepo("supabase/functions/_shared/require-caller.ts");
    expect(caller).toContain("auth.getUser()");
    expect(caller).toContain('from("profiles")');
    expect(caller).toContain("role: profile.role");
    expect(caller).toContain("tenantId: profile.tenant_id");
    expect(caller).not.toContain("user.app_metadata.role");
    expect(caller).toContain("inspection.tenant_id !== caller.tenantId");
    expect(caller).toContain("status: 401");
  });

  it("JWT verify está ligado nas Edges de produto e desligado só nas públicas", () => {
    const config = readRepo("supabase/config.toml");
    expect(config).toMatch(/\[functions\.create-report\][\s\S]*?verify_jwt = true/);
    expect(config).toMatch(/\[functions\.generate-pdf\][\s\S]*?verify_jwt = true/);
    expect(config).toMatch(/\[functions\.invite-user\][\s\S]*?verify_jwt = true/);
    expect(config).toMatch(/\[functions\.validate-report\][\s\S]*?verify_jwt = false/);
    expect(config).toMatch(/\[functions\.inspector-signup\][\s\S]*?verify_jwt = false/);
  });

  it("payload B2C autenticado não grava resultado/URL/status", () => {
    const sql = allMigrations();
    expect(sql).toContain("NEW.result_payload := NULL");
    expect(sql).toContain("NEW.document_url := NULL");
    expect(sql).toContain("NEW.status := 'PROCESSING'");
    expect(sql).toContain(
      "REVOKE INSERT, UPDATE, DELETE ON TABLE public.consumer_consultas FROM PUBLIC, anon, authenticated",
    );
  });

  it("documento do vistoriador não entra no JWT/metadata", () => {
    const adapter = readRepo("src/core/auth/services/supabase-auth-adapter.ts");
    expect(adapter).toContain("strip_own_auth_document_metadata");
    const signup = readRepo("supabase/functions/inspector-signup/index.ts");
    expect(signup).not.toMatch(/user_metadata:\s*\{[^}]*document:/);
  });
});

describe("Fase E — dados mascarados e logs", () => {
  it("logger redige CPF/CNPJ/e-mail", () => {
    const logger = readRepo("src/core/observability/logger.ts");
    expect(logger).toContain("[redacted-cpf]");
    expect(logger).toContain("[redacted-cnpj]");
    expect(logger).toContain("[redacted-email]");
  });

  it("UI padrão mascara; PDF autorizado formata completo", () => {
    expect(readRepo("src/modules/torres-vistoria/pages/inspection-detail-page.tsx")).toContain(
      "redactDocument",
    );
    expect(readRepo("src/modules/torres-vistoria/domain/laudo/laudo-doc-definition.ts")).toContain(
      "formatDocument",
    );
  });
});
