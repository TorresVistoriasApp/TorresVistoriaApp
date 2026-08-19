import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const FUNCTION_PATH = path.resolve(
  process.cwd(),
  "supabase/functions/send-email/index.ts",
);

function readFileSafe(p: string): string {
  return readFileSync(p, "utf8");
}

describe("send-email hook contract (Fase 5)", () => {
  const src = readFileSafe(FUNCTION_PATH);

  it("usa RESEND para enviar emails", () => {
    expect(src).toContain("import { Resend } from \"npm:resend@^6\"");
    expect(src).toContain("resend.emails.send");
  });

  it("suporta signup e recovery", () => {
    expect(src).toContain("emailActionType === \"signup\"");
    expect(src).toContain("emailActionType === \"recovery\"");
  });

  it("tem títulos e CTAs em português", () => {
    expect(src).toContain("Confirme seu endereço de e-mail");
    expect(src).toContain("Confirmar e-mail");
    expect(src).toContain("Redefina sua senha");
    expect(src).toContain("Redefinir senha");
  });

  it("usa template de marca Torres Consulta", () => {
    const template = readFileSafe(
      path.resolve(process.cwd(), "supabase/functions/send-email/email-template.ts"),
    );
    expect(template).toContain("Torres Consulta");
    expect(template).toContain("#ea580c");
    expect(template).toContain("Consulta veicular para você");
    expect(template).toContain("renderBulletproofButton");
    expect(template).toContain("v:roundrect");
  });

  it("monta confirmation URL via /auth/v1/verify com token e redirect_to", () => {
    expect(src).toContain("new URL(\"/auth/v1/verify\", supabaseUrl)");
    expect(src).toContain("verifyBase.searchParams.set(\"token\", tokenHash)");
    expect(src).toContain("verifyBase.searchParams.set(\"type\", emailActionType)");
    expect(src).toContain("verifyBase.searchParams.set(\"redirect_to\", redirectTo)");
  });
});

