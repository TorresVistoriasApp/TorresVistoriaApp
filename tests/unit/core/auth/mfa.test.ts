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

import { isMfaChallengeRequired, verifyMfaTotpCode } from "@/core/auth/mfa";

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

  it("não exige MFA quando a consulta de AAL falha", async () => {
    mocks.getAuthenticatorAssuranceLevel.mockResolvedValue({
      data: null,
      error: new Error("unavailable"),
    });
    await expect(isMfaChallengeRequired()).resolves.toBe(false);
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
