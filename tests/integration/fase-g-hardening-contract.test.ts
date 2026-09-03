import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

function readRepo(relativePath: string): string {
  return readFileSync(path.resolve(process.cwd(), relativePath), "utf8");
}

describe("Fase G hardening — created_by e pending/", () => {
  it("JWT não escolhe created_by no INSERT e não altera no UPDATE", () => {
    const sql = readRepo("supabase/migrations/20260903140000_fase_g_hardening.sql");
    expect(sql).toContain("NEW.created_by := auth.uid();");
    expect(sql).toContain("created_by não pode ser alterado.");
    expect(sql).not.toContain("AND NEW.created_by IS NULL");
  });

  it("pending/ deixa de ser path canônico e o mapa legado some do JWT", () => {
    const sql = readRepo("supabase/migrations/20260903140000_fase_g_hardening.sql");
    expect(sql).toContain("p_name NOT LIKE 'pending/%'");
    expect(sql).toContain("laudos pending/ não são mais aceitos");
    expect(sql).toContain("DROP POLICY IF EXISTS legacy_storage_path_map_admin");
    expect(sql).toContain("REVOKE ALL ON TABLE public.legacy_storage_path_map");
    expect(readRepo("src/modules/torres-vistoria/domain/legacy-migration.ts")).toContain(
      'if (storagePath.startsWith("pending/")) return false',
    );
  });
});

describe("Fase G hardening — Edges e laudo", () => {
  it("Edges que estavam sem limite passam a usar persistência + CF-Connecting-IP", () => {
    for (const file of [
      "supabase/functions/onboard-company/index.ts",
      "supabase/functions/inspector-registrations/index.ts",
      "supabase/functions/compress-image/index.ts",
      "supabase/functions/generate-pdf/index.ts",
    ]) {
      const src = readRepo(file);
      expect(src).toContain("enforceCallerRateLimit");
    }
    const shared = readRepo("supabase/functions/_shared/rate-limit.ts");
    expect(shared).toContain("cf-connecting-ip");
    expect(shared).toContain("parts[parts.length - 1]");
    expect(shared).toContain("consumePersistentRateLimit");
  });

  it("create-report continua só com inspectionId e PDF oficial no servidor", () => {
    const edge = readRepo("supabase/functions/create-report/index.ts");
    expect(edge).toContain("buildOfficialLaudoPdf");
    expect(edge).not.toContain('action === "seal"');
    expect(edge).not.toContain("body.verificationCode");
    expect(readRepo("src/modules/torres-vistoria/services/pdf-service.ts")).toContain(
      "body: { inspectionId: params.inspection.id }",
    );
  });

  it("invite-user mantém SUPER_ADMIN, role e origem canônica", () => {
    const invite = readRepo("supabase/functions/invite-user/index.ts");
    expect(invite).toContain("canonicalAppOrigin");
    expect(invite).toContain("ALLOWED_ROLES");
    expect(invite).toContain("consumePersistentRateLimit");
  });
});

describe("Fase G hardening — MFA E2E e CSP", () => {
  it("E2E do admin completa TOTP quando o secret existe", () => {
    expect(readRepo("tests/e2e/helpers.ts")).toContain("E2E_ADMIN_TOTP_SECRET");
    expect(readRepo("tests/e2e/totp.ts")).toContain("generateTotp");
    expect(readRepo("src/core/auth/mfa.ts")).toContain("isPrivilegedAccount");
    expect(readRepo("src/core/auth/components/mfa-totp-section.tsx")).toContain("lockLastFactor");
  });

  it("CSP não usa mais img-src https: amplo", () => {
    const vercel = readRepo("vercel.json");
    expect(vercel).toContain("img-src 'self' data: blob: https://ljzttzfjtskblxekmquu.supabase.co");
    expect(vercel).not.toContain("img-src 'self' data: blob: https:;");
    expect(vercel).toContain("style-src 'self' 'unsafe-inline'");
  });
});
