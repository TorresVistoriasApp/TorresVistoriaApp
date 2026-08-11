import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const MIGRATION = "20260811120000_consumer_profiles_foundation.sql";

function readMigration(fileName: string): string {
  return readFileSync(
    path.resolve(process.cwd(), "supabase/migrations", fileName),
    "utf8",
  );
}

/**
 * Contrato estático de isolamento B2C (complementa pgTAP em supabase/tests).
 */
describe("consumer_profiles RLS contract (migration)", () => {
  const sql = readMigration(MIGRATION);

  it("cria consumer_profiles com account_status e campos de exclusão futuros", () => {
    expect(sql).toContain("CREATE TABLE public.consumer_profiles");
    expect(sql).toContain("account_status");
    expect(sql).toContain("pending_deletion");
    expect(sql).toContain("deletion_requested_at");
    expect(sql).toContain("deletion_scheduled_at");
  });

  it("habilita RLS e isola SELECT/UPDATE por auth.uid()", () => {
    expect(sql).toContain("ALTER TABLE public.consumer_profiles ENABLE ROW LEVEL SECURITY");
    expect(sql).toContain("consumer_profiles_select_self");
    expect(sql).toContain("consumer_profiles_update_self");
    expect(sql).toContain("id = auth.uid()");
  });

  it("não concede INSERT direto ao authenticated (criação via trigger)", () => {
    expect(sql).not.toContain("consumer_profiles_insert");
    expect(sql).toContain("INSERT deliberadamente sem policy para authenticated");
  });

  it("define is_consumer() para checagem de identidade", () => {
    expect(sql).toContain("CREATE OR REPLACE FUNCTION public.is_consumer()");
    expect(sql).toContain("FROM public.consumer_profiles");
    expect(sql).toContain("WHERE id = auth.uid()");
  });

  it("handle_new_user reconhece user_type consumer antes do tenant", () => {
    expect(sql).toContain("IF v_user_type = 'consumer' THEN");
    expect(sql).toContain("INSERT INTO public.consumer_profiles");
    expect(sql).toContain("raw_user_meta_data->>'user_type'");
    expect(sql).toContain("INSERT INTO public.platform_admins");
  });

  it("impede escalonamento de status de conta pelo próprio consumidor", () => {
    expect(sql).toContain("prevent_consumer_profile_self_escalation");
    expect(sql).toContain("account_status IS DISTINCT FROM OLD.account_status");
  });

  it("Consumer A não pode acessar Consumer B — policy usa somente auth.uid()", () => {
    const selectPolicy = sql.match(
      /CREATE POLICY consumer_profiles_select_self[\s\S]*?;/,
    )?.[0];
    expect(selectPolicy).toBeTruthy();
    expect(selectPolicy).toContain("id = auth.uid()");
    expect(selectPolicy).not.toMatch(/\bOR\b/);
  });
});
