import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  rpc: vi.fn(),
  signOut: vi.fn(),
  getProfile: vi.fn(),
}));

vi.mock("@/infra/supabase/client", () => ({
  db: {
    rpc: mocks.rpc,
    from: vi.fn(),
  },
}));

vi.mock("@/core/auth/auth-service", () => ({
  authService: {
    getProfile: mocks.getProfile,
    signOut: mocks.signOut,
  },
}));

import { lgpdService } from "@/core/compliance/lgpd-service";

describe("lgpdService.requestAccountDeletion — isolamento (Fase A)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.rpc.mockResolvedValue({ error: null });
    mocks.signOut.mockResolvedValue(undefined);
  });

  it("continua invocando anonymize_user_account só com o próprio user_id (self LGPD)", async () => {
    await lgpdService.requestAccountDeletion("user-self");
    expect(mocks.rpc).toHaveBeenCalledWith("anonymize_user_account", {
      p_user_id: "user-self",
    });
    expect(mocks.signOut).toHaveBeenCalled();
  });
});
