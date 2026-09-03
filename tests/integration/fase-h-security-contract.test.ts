import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

function readRepo(relativePath: string): string {
  return readFileSync(path.resolve(process.cwd(), relativePath), "utf8");
}

describe("Fase H — Turnstile fail-closed", () => {
  it("Edges recusam sem secret quando TURNSTILE_REQUIRED=true", () => {
    const turnstile = readRepo("supabase/functions/_shared/turnstile.ts");
    expect(turnstile).toContain('Deno.env.get("TURNSTILE_REQUIRED")?.trim() === "true"');
    expect(turnstile).toContain("Verificação anti-bot obrigatória.");
    expect(turnstile).not.toContain("TURNSTILE_SECRET_KEY=");
  });

  it("frontend recusa submit se VITE_TURNSTILE_REQUIRED sem site key", () => {
    expect(readRepo("src/config/turnstile.ts")).toContain("isTurnstileRequired");
    expect(readRepo("src/core/security/use-turnstile.tsx")).toContain(
      "Verificação anti-bot obrigatória, mas a site key não está configurada.",
    );
    expect(readRepo(".env.example")).toContain("VITE_TURNSTILE_REQUIRED");
    expect(readRepo(".env.example")).not.toMatch(/^TURNSTILE_SECRET_KEY=.+/m);
  });
});

describe("Fase H — Edges, PII e storage", () => {
  it("mutating Edges recusam método diferente de POST", () => {
    for (const file of [
      "supabase/functions/create-report/index.ts",
      "supabase/functions/generate-pdf/index.ts",
      "supabase/functions/invite-user/index.ts",
      "supabase/functions/onboard-company/index.ts",
      "supabase/functions/compress-image/index.ts",
      "supabase/functions/inspector-signup/index.ts",
      "supabase/functions/inspector-registrations/index.ts",
    ]) {
      expect(readRepo(file)).toContain("rejectNonPost");
    }
    expect(readRepo("supabase/functions/validate-report/index.ts")).toContain("GET");
  });

  it("detalhe de vistoria mascara chassi; laudo oficial continua com valor completo", () => {
    expect(readRepo("src/modules/torres-vistoria/pages/inspection-detail-page.tsx")).toContain(
      "redactChassis(inspection.chassis)",
    );
    expect(readRepo("supabase/functions/_shared/official-laudo-pdf.ts")).toContain(
      "input.inspection.chassis",
    );
  });

  it("diagnóstico de pending/ não apaga objetos", () => {
    const script = readRepo("scripts/diagnose-legacy-storage.mjs");
    expect(script).toContain("pending/");
    expect(script).not.toContain(".remove(");
    expect(script).not.toContain(".remove([");
  });

  it("send-email não registra o objeto de erro cru", () => {
    const src = readRepo("supabase/functions/send-email/index.ts");
    expect(src).not.toContain('console.error("[send-email] resend error", error)');
    expect(src).toContain('console.error("[send-email] resend error", {');
  });

  it("create-report ignora tenant/createdBy do body e usa JWT", () => {
    const edge = readRepo("supabase/functions/create-report/index.ts");
    expect(edge).toContain("requireCaller");
    expect(edge).not.toContain("body.tenantId");
    expect(edge).not.toContain("body.createdBy");
    expect(readRepo("src/infra/supabase/client.ts")).not.toContain("SERVICE_ROLE");
    expect(readRepo("src/config/env.ts")).not.toContain("SERVICE_ROLE");
  });
});
