import { describe, expect, it, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => ({
  signUp: vi.fn(),
}));

vi.mock("@/infra/supabase/client", () => ({
  db: {
    auth: {
      signUp: mocks.signUp,
    },
  },
}));

import { supabaseAuthAdapter } from "@/core/auth/services/supabase-auth-adapter";

describe("supabaseAuthAdapter.signUp", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("rejeita cadastro quando identities está vazio (e-mail já existente)", async () => {
    mocks.signUp.mockResolvedValue({
      data: { user: { id: "u1", identities: [] }, session: null },
      error: null,
    });

    await expect(
      supabaseAuthAdapter.signUp("existente@test.com", "SenhaForte1!", { user_type: "consumer" }),
    ).rejects.toThrow("Já existe uma conta associada a este e-mail.");
  });

  it("aceita cadastro quando há identity", async () => {
    mocks.signUp.mockResolvedValue({
      data: {
        user: { id: "u2", identities: [{ id: "id1" }] },
        session: null,
      },
      error: null,
    });

    await expect(
      supabaseAuthAdapter.signUp("novo@test.com", "SenhaForte1!", { user_type: "consumer" }),
    ).resolves.toMatchObject({ user: { id: "u2" } });
  });
});
