import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

function readRepo(relativePath: string): string {
  return readFileSync(path.resolve(process.cwd(), relativePath), "utf8");
}

function latestFunction(marker: string, endMarker: string): string {
  const dir = path.resolve(process.cwd(), "supabase/migrations");
  const files = readdirSync(dir)
    .filter((name) => name.endsWith(".sql"))
    .sort()
    .reverse();
  for (const file of files) {
    const sql = readFileSync(path.join(dir, file), "utf8");
    if (sql.includes(marker)) {
      const start = sql.indexOf(marker);
      const end = sql.indexOf(endMarker, start);
      return sql.slice(start, end === -1 ? undefined : end);
    }
  }
  throw new Error(`${marker} não encontrado nas migrations`);
}

const FASE_B = "supabase/migrations/20260902160000_fase_b_consulta_rpc_rate_limit.sql";

describe("Fase B — NS-005 payload falso em consulta B2C", () => {
  it("INSERT autenticado zera resultado, URL, payload e status administrativo", () => {
    const sql = latestFunction(
      "CREATE OR REPLACE FUNCTION public.prevent_consumer_consulta_tampering()",
      "REVOKE ALL ON FUNCTION public.prevent_consumer_consulta_tampering()",
    );
    expect(sql).toContain("NEW.status := 'PROCESSING'");
    expect(sql).toContain("NEW.result_payload := NULL");
    expect(sql).toContain("NEW.document_url := NULL");
    expect(sql).toContain("NEW.failure_reason := NULL");
    expect(sql).toContain("NEW.completed_at := NULL");
    expect(sql).toContain("Consumidor não pode alterar consulta existente.");
  });

  it("PostgREST autenticado não tem INSERT/UPDATE/DELETE em consumer_consultas", () => {
    const sql = readRepo(FASE_B);
    expect(sql).toContain("DROP POLICY IF EXISTS consumer_consultas_insert_self");
    expect(sql).toContain(
      "REVOKE INSERT, UPDATE, DELETE ON TABLE public.consumer_consultas FROM PUBLIC, anon, authenticated",
    );
    expect(sql).toContain("GRANT SELECT ON TABLE public.consumer_consultas TO authenticated");
  });

  it("solicitação B2C só entra por RPC que ignora payload/status do cliente", () => {
    const sql = latestFunction(
      "CREATE OR REPLACE FUNCTION public.request_consumer_consulta(",
      "REVOKE ALL ON FUNCTION public.request_consumer_consulta",
    );
    expect(sql).toContain("'PROCESSING'");
    expect(sql).toContain("auth.uid()");
    expect(sql).not.toContain("p_result_payload");
    expect(sql).not.toContain("p_document_url");
    expect(sql).not.toContain("p_status");
    expect(sql).toContain("WHEN 'Básico' THEN 'BASIC'");
  });

  it("frontend solicita consulta via RPC e não faz insert direto", () => {
    const src = readRepo("src/modules/torres-consulta/repositories/consumer-consulta-repository.ts");
    expect(src).toContain('rpc("request_consumer_consulta"');
    expect(src).not.toMatch(/from\("consumer_consultas"\)[\s\S]*\.insert\(/);
  });
});

describe("Fase B — NS-008 RPC validate_report", () => {
  it("remove EXECUTE de anon/authenticated/PUBLIC; só service_role", () => {
    const sql = readRepo(FASE_B);
    expect(sql).toContain(
      "REVOKE ALL ON FUNCTION public.validate_report(TEXT) FROM PUBLIC, anon, authenticated",
    );
    expect(sql).toContain(
      "GRANT EXECUTE ON FUNCTION public.validate_report(TEXT) TO service_role",
    );
  });
});

describe("Fase B — NS-006 rate limit real e Turnstile", () => {
  it("bucket de rate limit vive no schema private e o wrapper é só service_role", () => {
    const sql = readRepo(FASE_B);
    expect(sql).toContain("CREATE TABLE IF NOT EXISTS private.rate_limit_buckets");
    expect(sql).toContain(
      "GRANT EXECUTE ON FUNCTION public.consume_rate_limit(TEXT, INTEGER, INTEGER) TO service_role",
    );
    expect(sql).toContain(
      "REVOKE ALL ON FUNCTION public.consume_rate_limit(TEXT, INTEGER, INTEGER)\n  FROM PUBLIC, anon, authenticated",
    );
  });

  it("Auth rate limit de e-mail não fica em 100/h", () => {
    const config = readRepo("supabase/config.toml");
    expect(config).toMatch(/email_sent\s*=\s*30/);
    expect(config).not.toMatch(/email_sent\s*=\s*100/);
    expect(config).toMatch(/sign_in_sign_ups\s*=\s*10/);
    expect(config).toContain('provider = "turnstile"');
  });

  it("Edges públicas consomem rate limit persistente e verificam Turnstile", () => {
    const signup = readRepo("supabase/functions/inspector-signup/index.ts");
    const validate = readRepo("supabase/functions/validate-report/index.ts");
    expect(signup).toContain("consumePersistentRateLimit");
    expect(signup).toContain("verifyTurnstileToken");
    expect(validate).toContain("consumePersistentRateLimit");
    expect(validate).toContain("verifyTurnstileToken");
  });

  it("cadastro de vistoriador não envia resultado de consulta nem document no Auth", () => {
    const signup = readRepo("supabase/functions/inspector-signup/index.ts");
    expect(signup).not.toMatch(/user_metadata:\s*\{[^}]*document:/);
  });
});
