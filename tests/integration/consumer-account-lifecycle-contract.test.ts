import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const MIGRATION = "20260813180000_consumer_account_lifecycle.sql";

function readMigration(fileName: string): string {
  return readFileSync(path.resolve(process.cwd(), "supabase/migrations", fileName), "utf8");
}

describe("consumer account lifecycle (migration)", () => {
  const sql = readMigration(MIGRATION);

  it("define RPCs de exclusão, reativação e finalização", () => {
    expect(sql).toContain("request_consumer_account_deletion");
    expect(sql).toContain("reactivate_consumer_account");
    expect(sql).toContain("finalize_expired_consumer_accounts");
  });

  it("usa carência de 90 dias na solicitação de exclusão", () => {
    expect(sql).toContain("INTERVAL '90 days'");
    expect(sql).toContain("pending_deletion");
  });

  it("permite bypass controlado no trigger anti-escalonamento", () => {
    expect(sql).toContain("app.bypass_consumer_escalation_guard");
  });

  it("is_consumer() exige conta active para operar consultas", () => {
    expect(sql).toContain("account_status = 'active'");
  });
});

describe("consumer account cleanup cron (migration)", () => {
  const sql = readFileSync(
    path.resolve(process.cwd(), "supabase/migrations", "20260813200000_schedule_consumer_account_cleanup_cron.sql"),
    "utf8",
  );

  it("agenda finalize_expired_consumer_accounts diariamente via pg_cron", () => {
    expect(sql).toContain("CREATE EXTENSION IF NOT EXISTS pg_cron");
    expect(sql).toContain("finalize-expired-consumer-accounts-daily");
    expect(sql).toContain("0 3 * * *");
    expect(sql).toContain("finalize_expired_consumer_accounts");
  });
});
