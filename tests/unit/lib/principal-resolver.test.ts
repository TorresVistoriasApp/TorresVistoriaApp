import { describe, expect, it, vi, beforeEach } from "vitest";
import { PrincipalType } from "@/core/rbac/roles";

const mocks = vi.hoisted(() => ({
  getSelfPlatformAdmin: vi.fn(),
  getProfile: vi.fn(),
  getSelfConsumer: vi.fn(),
}));

vi.mock("@/core/auth/platform-admin-service", () => ({
  platformAdminService: { getSelf: mocks.getSelfPlatformAdmin },
}));

vi.mock("@/core/auth/auth-service", () => ({
  authService: { getProfile: mocks.getProfile },
}));

vi.mock("@/core/auth/consumer-profile-service", () => ({
  consumerProfileService: { getSelf: mocks.getSelfConsumer },
}));

import {
  getPrincipalType,
  isPrincipalType,
  resolvePrincipal,
  resolvePrincipalFromSession,
} from "@/core/auth/principal-resolver";

const USER_ID = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";

const platformAdmin = {
  id: USER_ID,
  full_name: "Platform",
  email: "platform@torres.app",
  is_active: true,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
  deleted_at: null,
};

const tenantProfile = {
  id: USER_ID,
  auth_user_id: USER_ID,
  tenant_id: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
  full_name: "Vistoriador",
  role: "INSPECTOR" as const,
  avatar_url: null,
  email: "inspector@empresa.com",
  phone: null,
  is_active: true,
  status: "ACTIVE",
  must_change_password: false,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
  deleted_at: null,
};

const consumerProfile = {
  id: USER_ID,
  full_name: "Consumidor",
  email: "consumer@email.com",
  phone: null,
  account_status: "active" as const,
  deletion_requested_at: null,
  deletion_scheduled_at: null,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
  deleted_at: null,
};

describe("resolvePrincipal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getSelfPlatformAdmin.mockResolvedValue(null);
    mocks.getProfile.mockResolvedValue(null);
    mocks.getSelfConsumer.mockResolvedValue(null);
  });

  it("resolve PLATFORM_ADMIN com precedência", async () => {
    mocks.getSelfPlatformAdmin.mockResolvedValue(platformAdmin);

    const result = await resolvePrincipal(USER_ID);

    expect(result).toEqual({
      status: "resolved",
      principalType: PrincipalType.PLATFORM_ADMIN,
      platformAdmin,
    });
    expect(mocks.getProfile).not.toHaveBeenCalled();
    expect(mocks.getSelfConsumer).not.toHaveBeenCalled();
  });

  it("resolve TENANT_MEMBER quando não é platform admin", async () => {
    mocks.getProfile.mockResolvedValue(tenantProfile);

    const result = await resolvePrincipal(USER_ID);

    expect(result).toEqual({
      status: "resolved",
      principalType: PrincipalType.TENANT_MEMBER,
      profile: tenantProfile,
    });
    expect(mocks.getSelfConsumer).not.toHaveBeenCalled();
  });

  it("resolve CUSTOMER quando não é tenant nem platform", async () => {
    mocks.getSelfConsumer.mockResolvedValue(consumerProfile);

    const result = await resolvePrincipal(USER_ID);

    expect(result).toEqual({
      status: "resolved",
      principalType: PrincipalType.CUSTOMER,
      consumerProfile,
    });
  });

  it("retorna unknown quando não há identidade de negócio", async () => {
    const result = await resolvePrincipal(USER_ID);
    expect(result).toEqual({ status: "unknown" });
  });
});

describe("resolvePrincipalFromSession", () => {
  it("sem sessão é anonymous", () => {
    expect(resolvePrincipalFromSession(false, undefined)).toEqual({ status: "anonymous" });
  });

  it("com sessão sem resolução imediata retorna unknown", () => {
    expect(resolvePrincipalFromSession(true, USER_ID)).toEqual({ status: "unknown" });
  });
});

describe("getPrincipalType / isPrincipalType", () => {
  it("extrai o tipo quando resolvido", async () => {
    mocks.getSelfConsumer.mockResolvedValue(consumerProfile);
    const resolution = await resolvePrincipal(USER_ID);

    expect(getPrincipalType(resolution)).toBe(PrincipalType.CUSTOMER);
    expect(isPrincipalType(resolution, PrincipalType.CUSTOMER)).toBe(true);
    expect(isPrincipalType(resolution, PrincipalType.TENANT_MEMBER)).toBe(false);
  });

  it("retorna null para anonymous/unknown", () => {
    expect(getPrincipalType({ status: "anonymous" })).toBeNull();
    expect(getPrincipalType({ status: "unknown" })).toBeNull();
  });
});
