import { describe, expect, it, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => ({
  signInWithPassword: vi.fn(),
  signOut: vi.fn(),
  getSelf: vi.fn(),
  getSelfInspector: vi.fn(),
}));

vi.mock("@/core/auth/services/supabase-auth-adapter", () => ({
  supabaseAuthAdapter: {
    signInWithPassword: mocks.signInWithPassword,
    signOut: mocks.signOut,
    signUp: vi.fn(),
    resetPasswordForEmail: vi.fn(),
    updatePassword: vi.fn(),
    resendSignupVerification: vi.fn(),
    getSession: vi.fn(),
  },
}));

vi.mock("@/core/auth/consumer-profile-service", () => ({
  consumerProfileService: { getSelf: mocks.getSelf },
}));

vi.mock("@/core/auth/inspector-registration-service", () => ({
  inspectorRegistrationService: { getSelf: mocks.getSelfInspector },
}));

import { consumerAuthService } from "@/core/auth/services/consumer-auth-service";

const consumerProfile = {
  id: "user-1",
  full_name: "Consumidor",
  email: "c@test.com",
  phone: null,
  account_status: "active",
  deletion_requested_at: null,
  deletion_scheduled_at: null,
  created_at: "2026-01-01",
  updated_at: "2026-01-01",
  deleted_at: null,
};

describe("consumerAuthService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getSelfInspector.mockResolvedValue(null);
  });

  it("signIn aceita consumidor com perfil ativo", async () => {
    mocks.signInWithPassword.mockResolvedValue({ user: { id: "user-1" } });
    mocks.getSelf.mockResolvedValue(consumerProfile);

    await expect(
      consumerAuthService.signIn({
        email: "c@test.com",
        password: "SenhaForte1!",
        acceptTerms: true,
      }),
    ).resolves.toBeUndefined();
  });

  it("signIn rejeita conta sem consumer_profiles", async () => {
    mocks.signInWithPassword.mockResolvedValue({ user: { id: "tenant-1" } });
    mocks.getSelf.mockResolvedValue(null);

    await expect(
      consumerAuthService.signIn({
        email: "v@test.com",
        password: "SenhaForte1!",
        acceptTerms: true,
      }),
    ).rejects.toThrow("Torres Vistoria");

    expect(mocks.signOut).toHaveBeenCalled();
  });
});
