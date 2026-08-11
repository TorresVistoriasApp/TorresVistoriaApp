import { authService } from "@/core/auth/auth-service";
import { consumerProfileService } from "@/core/auth/consumer-profile-service";
import { platformAdminService } from "@/core/auth/platform-admin-service";
import type { ConsumerProfile, PlatformAdmin, Profile } from "@/core/auth/types";
import { PrincipalType, type PrincipalType as PrincipalTypeValue } from "@/core/rbac/roles";

export type PrincipalResolution =
  | {
      status: "resolved";
      principalType: typeof PrincipalType.PLATFORM_ADMIN;
      platformAdmin: PlatformAdmin;
    }
  | {
      status: "resolved";
      principalType: typeof PrincipalType.TENANT_MEMBER;
      profile: Profile;
    }
  | {
      status: "resolved";
      principalType: typeof PrincipalType.CUSTOMER;
      consumerProfile: ConsumerProfile;
    }
  | { status: "anonymous" }
  | { status: "unknown" };

/**
 * Resolve a identidade de negócio de um usuário autenticado.
 *
 * Ordem deliberada (mutuamente exclusiva na prática):
 * 1. PLATFORM_ADMIN — operador SaaS, sem tenant
 * 2. TENANT_MEMBER — membro de empresa (Torres Vistoria)
 * 3. CUSTOMER — consumidor B2C (Torres Consulta)
 *
 * A autorização real permanece no banco (RLS); este resolver espelha o estado
 * para navegação e guards no frontend.
 */
export async function resolvePrincipal(userId: string): Promise<PrincipalResolution> {
  const platformAdmin = await platformAdminService.getSelf(userId);
  if (platformAdmin) {
    return {
      status: "resolved",
      principalType: PrincipalType.PLATFORM_ADMIN,
      platformAdmin,
    };
  }

  const profile = await authService.getProfile(userId);
  if (profile) {
    return {
      status: "resolved",
      principalType: PrincipalType.TENANT_MEMBER,
      profile,
    };
  }

  const consumerProfile = await consumerProfileService.getSelf(userId);
  if (consumerProfile) {
    return {
      status: "resolved",
      principalType: PrincipalType.CUSTOMER,
      consumerProfile,
    };
  }

  return { status: "unknown" };
}

export function resolvePrincipalFromSession(
  hasSession: boolean,
  userId: string | undefined,
): PrincipalResolution {
  if (!hasSession || !userId) {
    return { status: "anonymous" };
  }
  return { status: "unknown" };
}

export function getPrincipalType(resolution: PrincipalResolution): PrincipalTypeValue | null {
  if (resolution.status !== "resolved") return null;
  return resolution.principalType;
}

export function isPrincipalType(
  resolution: PrincipalResolution,
  type: PrincipalTypeValue,
): boolean {
  return resolution.status === "resolved" && resolution.principalType === type;
}
