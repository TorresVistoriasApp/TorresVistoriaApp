import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getAuthenticatorAssuranceLevel: vi.fn(),
  listFactors: vi.fn(),
  challenge: vi.fn(),
  verify: vi.fn(),
}));

vi.mock("@/infra/supabase/client", () => ({
  db: {
    auth: {
      mfa: {
        getAuthenticatorAssuranceLevel: mocks.getAuthenticatorAssuranceLevel,
        listFactors: mocks.listFactors,
        challenge: mocks.challenge,
        verify: mocks.verify,
      },
    },
  },
}));

import {
  isMfaChallengeRequired,
  isPrivilegedAccount,
  lookupMfaAssurance,
  resolvePrivilegedMfaUi,
  verifyMfaTotpCode,
} from "@/core/auth/mfa";

describe("MFA TOTP", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("exige desafio só quando nextLevel é aal2 e a sessão ainda está em aal1", async () => {
    mocks.getAuthenticatorAssuranceLevel.mockResolvedValue({
      data: { currentLevel: "aal1", nextLevel: "aal2" },
      error: null,
    });
    await expect(isMfaChallengeRequired()).resolves.toBe(true);

    mocks.getAuthenticatorAssuranceLevel.mockResolvedValue({
      data: { currentLevel: "aal2", nextLevel: "aal2" },
      error: null,
    });
    await expect(isMfaChallengeRequired()).resolves.toBe(false);
  });

  it("consulta de AAL com erro não é tratada como desafio, e sim como desconhecida", async () => {
    mocks.getAuthenticatorAssuranceLevel.mockResolvedValue({
      data: null,
      error: new Error("unavailable"),
    });
    await expect(isMfaChallengeRequired()).resolves.toBe(false);
    await expect(lookupMfaAssurance()).resolves.toBe("unknown");
  });

  it("SUPER_ADMIN com AAL desconhecido não entra como MFA desnecessário", () => {
    expect(
      resolvePrivilegedMfaUi({
        privileged: true,
        assurance: "unknown",
        hasVerifiedFactor: false,
      }),
    ).toBe("unknown");
    expect(
      resolvePrivilegedMfaUi({
        privileged: true,
        assurance: "clear",
        hasVerifiedFactor: null,
      }),
    ).toBe("unknown");
  });

  it("INSPECTOR sem MFA e com AAL desconhecido permanece operacional", () => {
    expect(
      resolvePrivilegedMfaUi({
        privileged: false,
        assurance: "unknown",
        hasVerifiedFactor: false,
      }),
    ).toBe("allow");
    expect(
      resolvePrivilegedMfaUi({
        privileged: false,
        assurance: "clear",
        hasVerifiedFactor: false,
      }),
    ).toBe("allow");
  });

  it("SUPER_ADMIN / PLATFORM_ADMIN: AAL1 exige desafio; AAL2 com fator permite; sem fator exige enrollment", () => {
    expect(
      resolvePrivilegedMfaUi({
        privileged: true,
        assurance: "challenge",
        hasVerifiedFactor: true,
      }),
    ).toBe("challenge");
    expect(
      resolvePrivilegedMfaUi({
        privileged: true,
        assurance: "clear",
        hasVerifiedFactor: true,
      }),
    ).toBe("allow");
    expect(
      resolvePrivilegedMfaUi({
        privileged: true,
        assurance: "clear",
        hasVerifiedFactor: false,
      }),
    ).toBe("enroll");
  });

  it("INSPECTOR em AAL1 sem fator não entra em enrollment obrigatório", () => {
    expect(
      resolvePrivilegedMfaUi({
        privileged: false,
        assurance: "challenge",
        hasVerifiedFactor: false,
      }),
    ).toBe("challenge");
    expect(
      resolvePrivilegedMfaUi({
        privileged: false,
        assurance: "clear",
        hasVerifiedFactor: false,
      }),
    ).toBe("allow");
    expect(isPrivilegedAccount({ role: "INSPECTOR" }, false)).toBe(false);
  });

  it("trata SUPER_ADMIN e operador da plataforma como conta privilegiada", () => {
    expect(isPrivilegedAccount({ role: "SUPER_ADMIN" }, false)).toBe(true);
    expect(isPrivilegedAccount({ role: "INSPECTOR" }, true)).toBe(true);
    expect(isPrivilegedAccount({ role: "INSPECTOR" }, false)).toBe(false);
    expect(isPrivilegedAccount(null, false)).toBe(false);
  });

  it("verifica o fator TOTP ativo", async () => {
    mocks.listFactors.mockResolvedValue({
      data: { totp: [{ id: "factor-1", status: "verified" }] },
      error: null,
    });
    mocks.challenge.mockResolvedValue({ data: { id: "challenge-1" }, error: null });
    mocks.verify.mockResolvedValue({ error: null });

    await expect(verifyMfaTotpCode("123456")).resolves.toBeUndefined();
    expect(mocks.verify).toHaveBeenCalledWith({
      factorId: "factor-1",
      challengeId: "challenge-1",
      code: "123456",
    });
  });
});
