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

describe("supabaseAuthAdapter.signUpInspector", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.invoke.mockResolvedValue({ data: { success: true }, error: null });
  });

  it("chama a Edge e não usa Auth signUp", async () => {
    await supabaseAuthAdapter.signUpInspector({
      name: "Ana Vistoriadora",
      email: "ana@empresa.com",
      document: "52998224725",
      documentType: "cpf",
      password: "SenhaForte1!xyz",
      acceptTerms: true,
    });

    expect(mocks.signUp).not.toHaveBeenCalled();
    expect(mocks.invoke).toHaveBeenCalledWith("inspector-signup", {
      body: {
        name: "Ana Vistoriadora",
        email: "ana@empresa.com",
        phone: undefined,
        document: "52998224725",
        documentType: "cpf",
        password: "SenhaForte1!xyz",
        acceptTerms: true,
      },
    });
  });
});
