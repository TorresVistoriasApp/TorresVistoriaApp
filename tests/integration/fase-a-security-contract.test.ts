import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const FASE_A = "20260902120000_fase_a_document_hmac_and_tenant_lock.sql";
const EDGE = "supabase/functions/inspector-registrations/index.ts";

function readRepo(relativePath: string): string {
  return readFileSync(path.resolve(process.cwd(), relativePath), "utf8");
}

describe("Fase A — contrato SQL de identificação e isolamento", () => {
  const sql = readRepo(path.join("supabase/migrations", FASE_A));
  const handleNewUser = sql.slice(
    sql.indexOf("CREATE OR REPLACE FUNCTION public.handle_new_user()"),
    sql.indexOf("REVOKE ALL ON FUNCTION public.handle_new_user()"),
  );
  const preventEscalation = sql.slice(
    sql.indexOf("CREATE OR REPLACE FUNCTION public.prevent_profile_self_escalation()"),
    sql.indexOf("REVOKE ALL ON FUNCTION public.prevent_profile_self_escalation()"),
  );
  const anonymize = sql.slice(
    sql.indexOf("CREATE OR REPLACE FUNCTION public.anonymize_user_account(p_user_id UUID)"),
    sql.indexOf("REVOKE ALL ON FUNCTION public.anonymize_user_account(UUID)"),
  );

  it("grava HMAC do documento e apaga o original do Auth metadata", () => {
    expect(handleNewUser).toContain("private.hmac_inspector_document(v_document_digits)");
    expect(handleNewUser).not.toContain("encode(digest(v_document_digits");
    expect(handleNewUser).toContain("PERFORM private.strip_auth_user_document(NEW.id)");
    expect(sql).toContain("raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) - 'document'");
  });

  it("não concede HMAC do documento a anon nem authenticated", () => {
    expect(sql).toContain(
      "REVOKE ALL ON FUNCTION public.hmac_inspector_document(TEXT) FROM PUBLIC, anon, authenticated",
    );
    expect(sql).toContain(
      "GRANT EXECUTE ON FUNCTION public.hmac_inspector_document(TEXT) TO service_role",
    );
    expect(sql).toContain("REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated, service_role");
  });

  it("bloqueia alteração de tenant_id/role/status no self-update inclusive SUPER_ADMIN", () => {
    expect(preventEscalation).toContain("NEW.tenant_id IS DISTINCT FROM OLD.tenant_id");
    expect(preventEscalation).not.toMatch(
      /IF public\.is_super_admin\(\) THEN\s+RETURN NEW;/,
    );
  });

  it("restringe anonimização cross-tenant e preserva self-delete LGPD", () => {
    expect(anonymize).toContain("IF auth.uid() = p_user_id THEN");
    expect(anonymize).toContain("public.is_super_admin()");
    expect(anonymize).toContain("public.get_user_tenant_id() IS NOT DISTINCT FROM v_tenant_id");
    expect(anonymize).not.toMatch(
      /IF auth\.uid\(\) <> p_user_id AND NOT public\.is_super_admin\(\) THEN/,
    );
  });
});

describe("Fase A — contrato da Edge de aprovação", () => {
  const edge = readRepo(EDGE);

  it("casa document_hash com HMAC e SHA-256 legado", () => {
    expect(edge).toContain("hmacInspectorDocument");
    expect(edge).toContain("legacySha256DocumentHex");
    expect(edge).toContain("indexInspectorDocumentHashes");
    expect(edge).not.toContain("hashDocumentDigits");
  });
});
