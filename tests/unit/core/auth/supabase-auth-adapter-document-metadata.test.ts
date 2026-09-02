import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  rpc: vi.fn(),
  refreshSession: vi.fn(),
  signUp: vi.fn(),
}));

vi.mock("@/infra/supabase/client", () => ({
  db: {
    auth: {
      getSession: mocks.getSession,
      refreshSession: mocks.refreshSession,
      signUp: mocks.signUp,
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      updateUser: vi.fn(),
      resend: vi.fn(),
    },
    rpc: mocks.rpc,
  },
}));

import { supabaseAuthAdapter } from "@/core/auth/services/supabase-auth-adapter";

describe("supabaseAuthAdapter.stripOwnAuthDocumentMetadata", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("não chama RPC quando não há sessão (confirmação de e-mail pendente)", async () => {
    mocks.getSession.mockResolvedValue({ data: { session: null }, error: null });
    await supabaseAuthAdapter.stripOwnAuthDocumentMetadata();
    expect(mocks.rpc).not.toHaveBeenCalled();
    expect(mocks.refreshSession).not.toHaveBeenCalled();
  });

  it("remove a chave document no banco e recarrega o JWT", async () => {
    mocks.getSession.mockResolvedValue({
      data: { session: { access_token: "jwt-com-documento" } },
      error: null,
    });
    mocks.rpc.mockResolvedValue({ error: null });
    mocks.refreshSession.mockResolvedValue({ error: null });

    await supabaseAuthAdapter.stripOwnAuthDocumentMetadata();

    expect(mocks.rpc).toHaveBeenCalledWith("strip_own_auth_document_metadata");
    expect(mocks.refreshSession).toHaveBeenCalledTimes(1);
  });
});
