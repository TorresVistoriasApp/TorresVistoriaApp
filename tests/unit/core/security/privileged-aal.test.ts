import { describe, expect, it } from "vitest";
import {
  evaluatePrivilegedGate,
  extractAalFromRequest,
  isLockedTenantAllowed,
} from "../../../../supabase/functions/_shared/aal";

function unsignedJwt(payload: Record<string, unknown>): string {
  const header = Buffer.from(JSON.stringify({ alg: "none", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${header}.${body}.sig`;
}

function requestWith(headers: Record<string, string>) {
  return {
    headers: {
      get(name: string) {
        const key = Object.keys(headers).find((k) => k.toLowerCase() === name.toLowerCase());
        return key ? headers[key] : null;
      },
    },
  };
}

describe("evaluatePrivilegedGate", () => {
  it("usuário não autenticado → 401", () => {
    const gate = evaluatePrivilegedGate({
      hasUser: false,
      isActive: true,
      roleAuthorized: true,
      aal: "aal2",
    });
    expect(gate).toEqual({
      error: "Sessão não autenticada. Efetue login novamente.",
      status: 401,
    });
  });

  it("AAL1 + role privilegiada → 403 MFA_REQUIRED", () => {
    const gate = evaluatePrivilegedGate({
      hasUser: true,
      isActive: true,
      roleAuthorized: true,
      aal: "aal1",
    });
    expect(gate).toEqual({
      error: "Verificação em duas etapas obrigatória.",
      status: 403,
      code: "MFA_REQUIRED",
    });
  });

  it("AAL2 + role correta → permitido", () => {
    expect(
      evaluatePrivilegedGate({
        hasUser: true,
        isActive: true,
        roleAuthorized: true,
        aal: "aal2",
      }),
    ).toEqual({ ok: true });
  });

  it("AAL2 + role incorreta → 403 sem MFA_REQUIRED", () => {
    const gate = evaluatePrivilegedGate({
      hasUser: true,
      isActive: true,
      roleAuthorized: false,
      aal: "aal2",
    });
    expect(gate).toEqual({
      error: "Você não possui permissão para executar esta operação.",
      status: 403,
    });
  });

  it("AAL2 + tenant incorreto → 403", () => {
    const gate = evaluatePrivilegedGate({
      hasUser: true,
      isActive: true,
      roleAuthorized: true,
      aal: "aal2",
      tenantAuthorized: false,
    });
    expect(gate).toEqual({
      error: "Você não possui permissão para executar esta operação.",
      status: 403,
    });
  });

  it("usuário inativo → 403", () => {
    const gate = evaluatePrivilegedGate({
      hasUser: true,
      isActive: false,
      roleAuthorized: true,
      aal: "aal2",
    });
    expect(gate).toEqual({
      error: "Esta conta está desativada.",
      status: 403,
    });
  });

  it("AAL ausente no JWT trata como insuficiente", () => {
    const gate = evaluatePrivilegedGate({
      hasUser: true,
      isActive: true,
      roleAuthorized: true,
      aal: null,
    });
    expect(gate).toMatchObject({ status: 403, code: "MFA_REQUIRED" });
  });
});

describe("extractAalFromRequest — só o Bearer autenticável", () => {
  it("lê aal do access token e ignora body/header forjados", () => {
    const aal1 = unsignedJwt({ aal: "aal1", sub: "user-1" });
    const req = requestWith({
      Authorization: `Bearer ${aal1}`,
      aal: "aal2",
      "x-aal": "aal2",
      "x-mfa": "verified",
    });
    expect(extractAalFromRequest(req)).toBe("aal1");

    const spoofed = evaluatePrivilegedGate({
      hasUser: true,
      isActive: true,
      roleAuthorized: true,
      aal: extractAalFromRequest(req),
    });
    expect(spoofed).toMatchObject({ code: "MFA_REQUIRED", status: 403 });
  });

  it("AAL2 no JWT autoriza; aal no JSON do cliente não entra na função", () => {
    const aal2 = unsignedJwt({ aal: "aal2", sub: "user-1" });
    expect(extractAalFromRequest(requestWith({ Authorization: `Bearer ${aal2}` }))).toBe("aal2");
    expect(extractAalFromRequest(requestWith({}))).toBeNull();
  });
});

describe("isLockedTenantAllowed", () => {
  const tenantA = "11111111-1111-1111-1111-111111111111";
  const tenantB = "22222222-2222-2222-2222-222222222222";

  it("SUPER_ADMIN travado não assume outro tenant", () => {
    expect(isLockedTenantAllowed(tenantA, tenantB)).toBe(false);
    expect(isLockedTenantAllowed(tenantA, tenantA)).toBe(true);
    expect(isLockedTenantAllowed(tenantA, undefined)).toBe(true);
  });

  it("operador da plataforma (lock nulo) pode informar tenant", () => {
    expect(isLockedTenantAllowed(null, tenantB)).toBe(true);
  });
});
