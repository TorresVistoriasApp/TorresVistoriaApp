import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

function readRepo(relativePath: string): string {
  return readFileSync(path.resolve(process.cwd(), relativePath), "utf8");
}

describe("Fase I.1 — AAL2 só em Edges privilegiadas", () => {
  it("helpers privilegiados exigem AAL do JWT, não do body", () => {
    for (const file of [
      "supabase/functions/_shared/require-super-admin.ts",
      "supabase/functions/_shared/require-platform-admin.ts",
      "supabase/functions/_shared/require-registration-approver.ts",
    ]) {
      const src = readRepo(file);
      expect(src).toContain("evaluatePrivilegedGate");
      expect(src).toContain("extractAalFromRequest");
      expect(src).toContain("auth.getUser()");
      expect(src).not.toContain("body.aal");
      expect(src).not.toContain("headers.get(\"aal\")");
      expect(src).not.toContain("headers.get(\"x-aal\")");
    }

    const aal = readRepo("supabase/functions/_shared/aal.ts");
    expect(aal).toContain('value === "aal1" || value === "aal2"');
    expect(aal).toContain("Authorization");
    expect(aal).toContain('code: "MFA_REQUIRED"');
    expect(aal).not.toContain("req.json()");
  });

  it("requireCaller de vistoriador não exige AAL2", () => {
    const caller = readRepo("supabase/functions/_shared/require-caller.ts");
    expect(caller).not.toContain("evaluatePrivilegedGate");
    expect(caller).not.toContain("extractAalFromRequest");
    expect(caller).not.toContain("aal2");
  });

  it("Edges privilegiadas usam os helpers com gate; públicas e de vistoria não", () => {
    expect(readRepo("supabase/functions/invite-user/index.ts")).toContain("requireSuperAdmin");
    expect(readRepo("supabase/functions/invite-user/index.ts")).toContain("jsonAuthGateResponse");
    expect(readRepo("supabase/functions/onboard-company/index.ts")).toContain("requirePlatformAdmin");
    expect(readRepo("supabase/functions/inspector-registrations/index.ts")).toContain(
      "requireRegistrationApprover",
    );
    expect(readRepo("supabase/functions/inspector-registrations/index.ts")).toContain(
      "isLockedTenantAllowed",
    );

    for (const file of [
      "supabase/functions/create-report/index.ts",
      "supabase/functions/generate-pdf/index.ts",
      "supabase/functions/compress-image/index.ts",
    ]) {
      const src = readRepo(file);
      expect(src).toContain("requireCaller");
      expect(src).not.toContain("evaluatePrivilegedGate");
      expect(src).not.toContain("requireSuperAdmin");
    }

    for (const file of [
      "supabase/functions/inspector-signup/index.ts",
      "supabase/functions/validate-report/index.ts",
      "supabase/functions/send-email/index.ts",
    ]) {
      const src = readRepo(file);
      expect(src).not.toContain("evaluatePrivilegedGate");
      expect(src).not.toContain("requireSuperAdmin");
      expect(src).not.toContain("requirePlatformAdmin");
    }
  });
});
