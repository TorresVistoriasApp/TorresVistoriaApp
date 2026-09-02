import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

function readRepo(relativePath: string): string {
  return readFileSync(path.resolve(process.cwd(), relativePath), "utf8");
}

function latestHandleNewUser(): string {
  const dir = path.resolve(process.cwd(), "supabase/migrations");
  const files = readdirSync(dir)
    .filter((name) => name.endsWith(".sql"))
    .sort()
    .reverse();
  for (const file of files) {
    const sql = readFileSync(path.join(dir, file), "utf8");
    if (sql.includes("CREATE OR REPLACE FUNCTION public.handle_new_user()")) {
      return sql.slice(
        sql.indexOf("CREATE OR REPLACE FUNCTION public.handle_new_user()"),
        sql.indexOf("REVOKE ALL ON FUNCTION public.handle_new_user()"),
      );
    }
  }
  throw new Error("handle_new_user não encontrado nas migrations");
}

function latestAnonymize(): string {
  const dir = path.resolve(process.cwd(), "supabase/migrations");
  const files = readdirSync(dir)
    .filter((name) => name.endsWith(".sql"))
    .sort()
    .reverse();
  for (const file of files) {
    const sql = readFileSync(path.join(dir, file), "utf8");
    const marker = "CREATE OR REPLACE FUNCTION public.anonymize_user_account(p_user_id UUID)";
    if (sql.includes(marker)) {
      return sql.slice(sql.indexOf(marker), sql.indexOf("REVOKE ALL ON FUNCTION public.anonymize_user_account(UUID)"));
    }
  }
  throw new Error("anonymize_user_account não encontrado");
}

function latestPreventEscalation(): string {
  const dir = path.resolve(process.cwd(), "supabase/migrations");
  const files = readdirSync(dir)
    .filter((name) => name.endsWith(".sql"))
    .sort()
    .reverse();
  for (const file of files) {
    const sql = readFileSync(path.join(dir, file), "utf8");
    const marker = "CREATE OR REPLACE FUNCTION public.prevent_profile_self_escalation()";
    if (sql.includes(marker)) {
      return sql.slice(
        sql.indexOf(marker),
        sql.indexOf("REVOKE ALL ON FUNCTION public.prevent_profile_self_escalation()"),
      );
    }
  }
  throw new Error("prevent_profile_self_escalation não encontrado");
}

describe("Fase A — fechamento: bypass cross-tenant", () => {
  it("SUPER_ADMIN não anonimiza usuário de outro tenant", () => {
    const sql = latestAnonymize();
    expect(sql).toContain("IF auth.uid() = p_user_id THEN");
    expect(sql).toContain("public.get_user_tenant_id() IS NOT DISTINCT FROM v_tenant_id");
    expect(sql).toContain("RAISE EXCEPTION 'Acesso negado'");
    expect(sql).not.toMatch(
      /IF auth\.uid\(\) <> p_user_id AND NOT public\.is_super_admin\(\) THEN/,
    );
  });

  it("SUPER_ADMIN não troca o próprio tenant_id (self-update)", () => {
    const sql = latestPreventEscalation();
    expect(sql).toContain("NEW.tenant_id IS DISTINCT FROM OLD.tenant_id");
    expect(sql).not.toMatch(/IF public\.is_super_admin\(\) THEN\s+RETURN NEW;/);
  });

  it("cadastro de inspector sem intent (bypass do canal seguro) é recusado", () => {
    const sql = latestHandleNewUser();
    expect(sql).toContain("Cadastro de vistoriador exige canal seguro.");
    expect(sql).toContain("signup_intent_id");
    expect(sql).not.toContain("private.hmac_inspector_document(v_document_digits)");
  });
});

describe("Fase A — fechamento: pepper/HMAC inacessível a usuários comuns", () => {
  it("schema private e HMAC não têm GRANT para anon/authenticated", () => {
    const sql = [
      readRepo("supabase/migrations/20260902120000_fase_a_document_hmac_and_tenant_lock.sql"),
      readRepo("supabase/migrations/20260902150000_fase_a_inspector_signup_intent.sql"),
    ].join("\n");

    expect(sql).toContain(
      "REVOKE ALL ON SCHEMA private FROM PUBLIC, anon, authenticated, service_role",
    );
    expect(sql).toContain(
      "REVOKE ALL ON FUNCTION public.hmac_inspector_document(TEXT) FROM PUBLIC, anon, authenticated",
    );
    expect(sql).toContain(
      "GRANT EXECUTE ON FUNCTION public.hmac_inspector_document(TEXT) TO service_role",
    );
    expect(sql).toContain(
      "REVOKE ALL ON FUNCTION public.prepare_inspector_signup(TEXT, TEXT) FROM PUBLIC, anon, authenticated",
    );
    expect(sql).toContain(
      "GRANT EXECUTE ON FUNCTION public.prepare_inspector_signup(TEXT, TEXT) TO service_role",
    );
    expect(sql).toContain(
      "REVOKE ALL ON TABLE private.inspector_document_pepper FROM PUBLIC, anon, authenticated, service_role",
    );
  });
});

describe("Fase A — fechamento: frontend e Edge não colocam documento no Auth", () => {
  it("serviço de cadastro não chama Auth signUp", () => {
    const src = readRepo("src/core/auth/services/inspector-auth-service.ts");
    expect(src).toContain("signUpInspector");
    expect(src).not.toMatch(/supabaseAuthAdapter\.signUp\(/);
  });

  it("Edge não envia document no user_metadata nem devolve token", () => {
    const src = readRepo("supabase/functions/inspector-signup/index.ts");
    expect(src).toContain("signup_intent_id");
    expect(src).toContain('JSON.stringify({ success: true })');
    expect(src).not.toContain("console.log");
    expect(src).not.toContain("access_token");
    expect(src).not.toMatch(/^\s*document:/m);
    expect(src).not.toMatch(/user_metadata:[\s\S]*?\bdocument:/);
  });
});
