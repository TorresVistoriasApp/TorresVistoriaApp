import { describe, expect, it, vi, beforeEach } from "vitest";

const { mockAuth, mockFrom } = vi.hoisted(() => ({
  mockAuth: {
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
    resetPasswordForEmail: vi.fn(),
  },
  mockFrom: vi.fn(),
}));

vi.mock("@/infra/supabase/client", () => ({
  db: {
    auth: mockAuth,
    from: mockFrom,
  },
}));

import { authService } from "@/core/auth/auth-service";

describe("authService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("signIn propaga erro do backend", async () => {
    mockAuth.signInWithPassword.mockResolvedValue({
      error: new Error("Credenciais inválidas"),
    });
    await expect(authService.signIn("a@b.com", "wrong")).rejects.toThrow("Credenciais inválidas");
  });

  it("signIn resolve sem erro", async () => {
    mockAuth.signInWithPassword.mockResolvedValue({
      error: null,
      data: { user: { id: "u1" } },
    });
    mockFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          is: () => ({
            maybeSingle: () => Promise.resolve({ data: { is_active: true }, error: null }),
          }),
        }),
      }),
    });
    await expect(authService.signIn("a@b.com", "ok1234")).resolves.toBeUndefined();
  });

  it("getProfile retorna perfil", async () => {
    const profile = { id: "u1", full_name: "Test", tenant_id: "c1", role: "INSPECTOR" };
    mockFrom.mockReturnValue({
      select: () => ({
        eq: () => ({
          is: () => ({
            maybeSingle: () => Promise.resolve({ data: profile, error: null }),
          }),
        }),
      }),
    });

    const result = await authService.getProfile("u1");
    expect(result).toEqual(profile);
  });
});
