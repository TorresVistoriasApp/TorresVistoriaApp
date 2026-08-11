import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const MIGRATION = "20260811160000_inspector_registrations_foundation.sql";

function readMigration(fileName: string): string {
  return readFileSync(
    path.resolve(process.cwd(), "supabase/migrations", fileName),
    "utf8",
  );
}

describe("inspector_registrations RLS contract (migration)", () => {
  const sql = readMigration(MIGRATION);

  it("cria inspector_registrations com documento hash e status", () => {
    expect(sql).toContain("CREATE TABLE public.inspector_registrations");
    expect(sql).toContain("document_hash");
    expect(sql).toContain("pending_approval");
  });

  it("handle_new_user reconhece user_type inspector", () => {
    expect(sql).toContain("IF v_user_type = 'inspector' THEN");
    expect(sql).toContain("INSERT INTO public.inspector_registrations");
  });

  it("habilita RLS e isola SELECT por auth.uid()", () => {
    expect(sql).toContain("ALTER TABLE public.inspector_registrations ENABLE ROW LEVEL SECURITY");
    expect(sql).toContain("inspector_registrations_select_self");
    expect(sql).toContain("id = auth.uid()");
  });

  it("não concede INSERT direto ao authenticated", () => {
    expect(sql).not.toContain("inspector_registrations_insert");
  });
});
