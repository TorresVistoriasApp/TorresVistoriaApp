import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

function readRepo(relativePath: string): string {
  return readFileSync(path.resolve(process.cwd(), relativePath), "utf8");
}

describe("Fase C — CORS das Edges", () => {
  it("não reflete *.vercel.app e só aceita origens conhecidas", () => {
    const cors = readRepo("supabase/functions/_shared/cors.ts");
    expect(cors).not.toMatch(/\*\.vercel\.app/);
    expect(cors).not.toMatch(/endsWith\(["']\.vercel\.app/);
    expect(cors).toContain("torres-vistoria-app.vercel.app");
    expect(cors).toContain("torresconsultas.com.br");
    expect(cors).toContain("ALLOWED_ORIGINS");
    expect(cors).toContain('Access-Control-Allow-Origin');
    expect(cors).toContain("isHttpsProductionSite");
  });
});

describe("Fase C — CSP gradual", () => {
  it("aperta connect-src sem cortar Supabase, Turnstile, ViaCEP ou Realtime", () => {
    const vercel = readRepo("vercel.json");
    expect(vercel).toContain("https://ljzttzfjtskblxekmquu.supabase.co");
    expect(vercel).toContain("wss://ljzttzfjtskblxekmquu.supabase.co");
    expect(vercel).toContain("https://challenges.cloudflare.com");
    expect(vercel).toContain("https://viacep.com.br");
    expect(vercel).toContain("img-src 'self' data: blob: https:");
    expect(vercel).toContain("style-src 'self' 'unsafe-inline'");
    expect(vercel).not.toMatch(/connect-src 'self' https: wss:/);
    expect(vercel).not.toMatch(/connect-src https:/);
  });
});

describe("Fase C — Service Worker e URLs assinadas", () => {
  it("não faz CacheFirst de storage assinado ou público", () => {
    const vite = readRepo("vite.config.ts");
    expect(vite).toContain("/storage/v1/object/sign/");
    expect(vite).toContain("NetworkOnly");
    const signBlock = vite.slice(
      vite.indexOf("/storage/v1/object/sign/"),
      vite.indexOf("/storage/v1/object/sign/") + 400,
    );
    expect(signBlock).toContain("NetworkOnly");
    expect(signBlock).not.toContain("CacheFirst");
  });

  it("logout limpa cache de URL assinada e o query client", () => {
    const signed = readRepo("src/infra/storage/signed-url.ts");
    expect(signed).toContain("caches.delete");
    const finalize = readRepo("src/core/auth/finalize-session.ts");
    expect(finalize).toContain("clearSignedUrlCache");
    expect(finalize).toContain("queryClient.clear");
    expect(readRepo("src/core/auth/auth-service.ts")).toContain("finalizeSession");
    expect(readRepo("src/core/auth/services/consumer-auth-service.ts")).toContain("finalizeSession");
  });
});

describe("Fase C — PII em logs e auditoria", () => {
  it("logger redige e-mail, CPF, CNPJ e token", () => {
    const logger = readRepo("src/core/observability/logger.ts");
    expect(logger).toContain("export function redactPii");
    expect(logger).toContain("[redacted-email]");
    expect(logger).toContain("[redacted-cpf]");
    expect(logger).toContain("[redacted-cnpj]");
  });

  it("auditoria redige documento de comprador/vendedor e hashes", () => {
    const sql = readRepo("supabase/migrations/20260902170000_fase_c_redact_audit_pii.sql");
    expect(sql).toContain("buyer_document");
    expect(sql).toContain("seller_document");
    expect(sql).toContain("document_hash");
    expect(sql).toContain("cpf");
    expect(sql).toContain("cnpj");
  });
});

describe("Fase C — anti-enumeração no cadastro", () => {
  it("adapter de Auth não rejeita identities vazio", () => {
    const adapter = readRepo("src/core/auth/services/supabase-auth-adapter.ts");
    expect(adapter).not.toMatch(/identities[\s\S]{0,80}Já existe uma conta/);
  });

  it("Edge de vistoriador responde sucesso genérico em e-mail duplicado", () => {
    const signup = readRepo("supabase/functions/inspector-signup/index.ts");
    expect(signup).toContain("isDuplicateUserError");
    expect(signup).toContain("success: true");
    expect(signup).not.toMatch(/status:\s*409/);
  });

  it("erro de e-mail já cadastrado vira mensagem genérica", () => {
    const errors = readRepo("src/core/errors/user-facing-errors.ts");
    expect(errors).toContain("Se este e-mail puder ser cadastrado");
    expect(errors).not.toContain("Já existe uma conta associada a este e-mail.");
  });
});

describe("Fase C — MFA opcional com desafio no login", () => {
  it("TOTP está habilitado no GoTrue e o desafio bloqueia rotas autenticadas", () => {
    const config = readRepo("supabase/config.toml");
    expect(config).toContain("[auth.mfa.totp]");
    expect(config).toMatch(/enroll_enabled\s*=\s*true/);
    expect(config).toMatch(/verify_enabled\s*=\s*true/);
    expect(readRepo("src/modules/admin/settings/pages/settings-page.tsx")).toContain("MfaTotpSection");
    expect(readRepo("src/routes/guards/protected-route.tsx")).toContain("mfaPending");
    expect(readRepo("src/routes/guards/platform-admin-route.tsx")).toContain("mfaPending");
    expect(readRepo("src/routes/guards/consumer-protected-route.tsx")).toContain("mfaPending");
    expect(readRepo("src/routes/guards/require-privileged-mfa.tsx")).toContain("mfaEnrollmentRequired");
    expect(readRepo("src/core/auth/mfa.ts")).toContain("isPrivilegedAccount");
  });
});

describe("Fase C — autorização das rotas administrativas", () => {
  it("usuários e auditoria exigem users.manage no manifesto", () => {
    const admin = readRepo("src/modules/admin/routes.tsx");
    expect(admin).toMatch(/ROUTES\.users[\s\S]*permission:\s*"users\.manage"/);
    expect(admin).toMatch(/ROUTES\.usersPendingRegistrations[\s\S]*permission:\s*"users\.manage"/);
    expect(admin).toMatch(/ROUTES\.audit[\s\S]*permission:\s*"users\.manage"/);
  });

  it("financeiro e relatórios exigem permissão no manifesto", () => {
    const vistoria = readRepo("src/modules/torres-vistoria/routes.tsx");
    expect(vistoria).toContain('anyOf: ["financial.manage", "financial.read.own"]');
    expect(vistoria).toMatch(/ROUTES\.financialRevenue[\s\S]*permission:\s*"financial\.manage"/);
    expect(vistoria).toMatch(/ROUTES\.financialExpenses[\s\S]*permission:\s*"financial\.manage"/);
    expect(vistoria).toMatch(/ROUTES\.reports[\s\S]*permission:\s*"reports\.export"/);
  });

  it("painel da plataforma continua atrás do PlatformAdminRoute", () => {
    const router = readRepo("src/routes/router.tsx");
    expect(router).toContain("PlatformAdminRoute");
    expect(router).toContain('collect("platform")');
  });
});
