import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const MIGRATION = "20260811140000_consumer_consultas_foundation.sql";

function readMigration(fileName: string): string {
  return readFileSync(
    path.resolve(process.cwd(), "supabase/migrations", fileName),
    "utf8",
  );
}

describe("consumer_consultas RLS contract (migration)", () => {
  const sql = readMigration(MIGRATION);

  it("cria consumer_credit_balances e consumer_consultas", () => {
    expect(sql).toContain("CREATE TABLE public.consumer_credit_balances");
    expect(sql).toContain("CREATE TABLE public.consumer_consultas");
    expect(sql).toContain("plan_name");
    expect(sql).toContain("result_payload");
  });

  it("inicializa saldo ao criar consumer_profiles", () => {
    expect(sql).toContain("initialize_consumer_credit_balance");
    expect(sql).toContain("trg_consumer_profiles_credit_balance");
  });

  it("habilita RLS e isola SELECT/INSERT por auth.uid()", () => {
    expect(sql).toContain("ALTER TABLE public.consumer_consultas ENABLE ROW LEVEL SECURITY");
    expect(sql).toContain("consumer_consultas_select_self");
    expect(sql).toContain("consumer_consultas_insert_self");
    expect(sql).toContain("consumer_id = auth.uid()");
  });

  it("não concede UPDATE direto ao consumidor nas consultas", () => {
    expect(sql).not.toContain("consumer_consultas_update");
    expect(sql).toContain("prevent_consumer_consulta_tampering");
  });

  it("força INSERT com status PROCESSING e credits_charged zero", () => {
    expect(sql).toContain("IF NEW.status <> 'PROCESSING' THEN");
    expect(sql).toContain("NEW.credits_charged := 0");
  });

  it("Consumer A não pode acessar Consumer B — policy usa somente auth.uid()", () => {
    const selectPolicy = sql.match(
      /CREATE POLICY consumer_consultas_select_self[\s\S]*?;/,
    )?.[0];
    expect(selectPolicy).toBeTruthy();
    expect(selectPolicy).toContain("consumer_id = auth.uid()");
    expect(selectPolicy).not.toMatch(/\bOR\b/);
  });
});
