import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  invoke: vi.fn(),
  signUp: vi.fn(),
}));

vi.mock("@/infra/supabase/client", () => ({
  db: {
    auth: { signUp: mocks.signUp },
    functions: { invoke: mocks.invoke },
  },
}));

import { supabaseAuthAdapter } from "@/core/auth/services/supabase-auth-adapter";

describe("supabaseAuthAdapter — captchaToken", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.invoke.mockResolvedValue({ data: { success: true }, error: null });
  });

  it("envia captchaToken à Edge de cadastro de vistoriador", async () => {
    await supabaseAuthAdapter.signUpInspector({
      name: "Ana Vistoriadora",
      email: "ana@empresa.com",
      document: "52998224725",
      documentType: "cpf",
      password: "SenhaForte1!xyz",
      acceptTerms: true,
      captchaToken: "turnstile-token",
    });

    expect(mocks.invoke).toHaveBeenCalledWith("inspector-signup", {
      body: expect.objectContaining({
        captchaToken: "turnstile-token",
        document: "52998224725",
      }),
    });
    expect(mocks.signUp).not.toHaveBeenCalled();
  });
});
