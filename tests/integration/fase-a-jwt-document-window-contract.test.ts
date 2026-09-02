import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const MIGRATION = "20260902140000_fase_a_strip_document_before_jwt.sql";

function readMigration(): string {
  return readFileSync(path.resolve(process.cwd(), "supabase/migrations", MIGRATION), "utf8");
}

describe("Fase A — janela JWT do documento do vistoriador", () => {
  const sql = readMigration();

  it("remove document no BEFORE INSERT/UPDATE, antes do RETURNING que o GoTrue assina", () => {
    expect(sql).toContain("CREATE TRIGGER trg_auth_users_stash_strip_document");
    expect(sql).toContain("BEFORE INSERT OR UPDATE ON auth.users");
    expect(sql).toContain("NEW.raw_user_meta_data := NEW.raw_user_meta_data - 'document'");
  });

  it("preserva os dígitos só na transação para o HMAC, sem devolvê-los no Auth", () => {
    expect(sql).toContain("set_config('torres.signup_document'");
    expect(sql).toContain("current_setting('torres.signup_document', true)");
    expect(sql).toContain("private.hmac_inspector_document(v_document_digits)");
  });

  it("também bloqueia reintrodução via updateUser no metadata", () => {
    expect(sql).toContain("BEFORE INSERT OR UPDATE ON auth.users");
    expect(sql).toContain("TG_OP = 'INSERT'");
  });
});
