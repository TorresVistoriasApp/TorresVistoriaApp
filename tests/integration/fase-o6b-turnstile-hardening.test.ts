import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

function readRepo(relativePath: string): string {
  return readFileSync(path.resolve(process.cwd(), relativePath), "utf8");
}

describe("Fase O.6-B — Turnstile hardening", () => {
  it("Edge e frontend usam parser estrito isEnvFlagTrue", () => {
    const edgeFlag = readRepo("supabase/functions/_shared/env-flag.ts");
    const frontFlag = readRepo("src/shared/lib/env-flag.ts");
    expect(edgeFlag).toContain('=== "true"');
    expect(frontFlag).toContain('=== "true"');
    expect(readRepo("supabase/functions/_shared/turnstile.ts")).toContain("isEnvFlagTrue");
    expect(readRepo("src/config/turnstile.ts")).toContain("isEnvFlagTrue");
  });

  it("verifyTurnstileToken documenta fail-open dev e timeout siteverify", () => {
    const turnstile = readRepo("supabase/functions/_shared/turnstile.ts");
    expect(turnstile).toContain("SITEVERIFY_TIMEOUT_MS");
    expect(turnstile).toContain("AbortController");
    expect(turnstile).not.toMatch(/headers\.get\([^)]*turnstile/i);
    expect(turnstile).not.toContain("console.log");
  });

  it("validate-report page fail-closed se required sem site key", () => {
    const page = readRepo("src/modules/torres-vistoria/pages/validate-report-page.tsx");
    expect(page).toContain("turnstileMisconfigured");
    expect(page).toContain("isTurnstileRequired");
    expect(page).toContain("getTurnstileSiteKey");
  });

  it("Edges públicas chamam verifyTurnstileToken antes da lógica de negócio", () => {
    const signup = readRepo("supabase/functions/inspector-signup/index.ts");
    const validate = readRepo("supabase/functions/validate-report/index.ts");
    expect(signup.indexOf("verifyTurnstileToken")).toBeLessThan(signup.indexOf("prepare_inspector_signup"));
    expect(validate.indexOf("verifyTurnstileToken")).toBeLessThan(validate.indexOf("verificationCode"));
  });
});
