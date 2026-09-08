import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

function readRepo(relativePath: string): string {
  return readFileSync(path.resolve(process.cwd(), relativePath), "utf8");
}

describe("Fase K — MFA obrigatório só para contas privilegiadas", () => {
  it("RequirePrivilegedMfa só bloqueia enrollment quando a sessão marcou mfaEnrollmentRequired", () => {
    const guard = readRepo("src/routes/guards/require-privileged-mfa.tsx");
    expect(guard).toContain("mfaEnrollmentRequired");
    expect(guard).toContain("mfaAssuranceUnknown");
    expect(guard).not.toContain("isMfaChallengeRequired");
  });

  it("auth-context só exige enrollment quando isPrivilegedAccount é verdadeiro", () => {
    const ctx = readRepo("src/core/auth/auth-context.tsx");
    expect(ctx).toContain("isPrivilegedAccount");
    expect(ctx).toContain("resolvePrivilegedMfaUi");
    expect(ctx).toContain("lookupMfaAssurance");
  });

  it("requireCaller das Edges operacionais do vistoriador não exige AAL2", () => {
    const caller = readRepo("supabase/functions/_shared/require-caller.ts");
    expect(caller).not.toContain("evaluatePrivilegedGate");
    expect(caller).not.toContain("aal2");
    for (const file of [
      "supabase/functions/create-report/index.ts",
      "supabase/functions/generate-pdf/index.ts",
      "supabase/functions/compress-image/index.ts",
    ]) {
      expect(readRepo(file)).toContain("requireCaller");
      expect(readRepo(file)).not.toContain("evaluatePrivilegedGate");
    }
  });
});
