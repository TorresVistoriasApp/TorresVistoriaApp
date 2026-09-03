import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

function readRepo(relativePath: string): string {
  return readFileSync(path.resolve(process.cwd(), relativePath), "utf8");
}

describe("Fase F — create-report server-authoritative", () => {
  it("ignora código, hash e path enviados pelo cliente", () => {
    const edge = readRepo("supabase/functions/create-report/index.ts");
    expect(edge).not.toContain("providedVerificationCode");
    expect(edge).not.toContain("providedIntegrityHash");
    expect(edge).not.toMatch(/verificationCode:\s*provided/);
    expect(edge).not.toContain('action === "seal"');
    expect(edge).toContain("buildVerificationCode");
    expect(edge).toContain("buildStoragePath");
    expect(edge).toContain("buildOfficialLaudoPdf");
    expect(edge).toContain('from("reports")');
    expect(edge).toContain("sha256Hex");
  });

  it("cliente só pede a vistoria e baixa o PDF já emitido no servidor", () => {
    const pdf = readRepo("src/modules/torres-vistoria/services/pdf-service.ts");
    const issueCall = pdf.slice(
      pdf.indexOf("registerProfessionalLaudo"),
      pdf.indexOf("registerProfessionalLaudo") + 2500,
    );
    expect(issueCall).toContain("body: { inspectionId: params.inspection.id }");
    expect(issueCall).not.toContain('action: "seal"');
    expect(issueCall).not.toContain(".upload(");
    expect(issueCall).toContain("downloadPdf(storagePath)");
    expect(pdf).not.toContain("buildReportStoragePath");

    const service = readRepo("src/modules/torres-vistoria/services/inspection-service.ts");
    expect(service).toContain("body: { inspectionId }");
    expect(service).not.toContain("storagePath");
    expect(service).not.toContain("sealReport");
  });
});

describe("Fase F — invite-user", () => {
  it("valida role e origem allowlist também no convite por e-mail", () => {
    const invite = readRepo("supabase/functions/invite-user/index.ts");
    expect(invite).toContain("canonicalAppOrigin");
    expect(invite).not.toContain('req.headers.get("origin")');
    const inviteBlock = invite.slice(invite.indexOf("inviteUserByEmail"));
    expect(invite.slice(0, invite.indexOf("inviteUserByEmail"))).toContain(
      "ALLOWED_ROLES.includes(role as AllowedRole)",
    );
    expect(inviteBlock).toContain("redirectTo: `${origin}/login`");
    expect(invite).toContain("consumePersistentRateLimit");
  });

  it("SUPER_ADMIN inativo não convida", () => {
    const guard = readRepo("supabase/functions/_shared/require-super-admin.ts");
    expect(guard).toContain("is_active");
    expect(guard).toContain("evaluatePrivilegedGate");
    expect(readRepo("supabase/functions/_shared/aal.ts")).toContain("Esta conta está desativada.");
  });
});

describe("Fase F — Turnstile fail-closed e rate limit", () => {
  it("produção HTTPS exige secret nas Edges", () => {
    const turnstile = readRepo("supabase/functions/_shared/turnstile.ts");
    expect(turnstile).toContain("TURNSTILE_REQUIRED");
    expect(turnstile).toContain("isTurnstileRequired");
    expect(turnstile).toContain('throw new TurnstileError("Verificação anti-bot obrigatória.")');
  });

  it("widget no front só com site key; B2C login tem rate limit de aba", () => {
    const config = readRepo("src/config/turnstile.ts");
    expect(config).toContain("getTurnstileSiteKey");
    expect(config).not.toContain("import.meta.env.PROD");
    const login = readRepo("src/modules/torres-consulta/pages/cliente/login-page.tsx");
    expect(login).toContain('checkRateLimit("consulta-login"');
  });

  it("rate limit das Edges não usa o primeiro IP de X-Forwarded-For", () => {
    const rate = readRepo("supabase/functions/_shared/rate-limit.ts");
    expect(rate).toContain("cf-connecting-ip");
    expect(rate).toContain("parts[parts.length - 1]");
    expect(rate).not.toContain('x-forwarded-for")?.split(",")[0]');
  });
});

describe("Fase F — MFA administrativo", () => {
  it("painel do tenant e da plataforma exigem TOTP para contas privilegiadas", () => {
    const router = readRepo("src/routes/router.tsx");
    expect(router).toContain("RequirePrivilegedMfa");
    expect(readRepo("src/core/auth/components/mfa-totp-section.tsx")).toContain("lockLastFactor");
    expect(readRepo("src/core/auth/mfa.ts")).toContain("hasVerifiedTotpFactor");
  });
});
