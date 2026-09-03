/**
 * AAL do GoTrue vive no access token (`aal`: "aal1" | "aal2").
 * Só lemos o Bearer já autenticado por auth.getUser() — nunca body/header custom.
 */

export type AuthenticatorAssuranceLevel = "aal1" | "aal2";

export type PrivilegedAuthFailure = {
  error: string;
  status: 401 | 403;
  code?: "MFA_REQUIRED";
};

export type PrivilegedGateInput = {
  hasUser: boolean;
  isActive: boolean;
  roleAuthorized: boolean;
  aal: AuthenticatorAssuranceLevel | null;
  tenantAuthorized?: boolean;
};

const UNAUTHENTICATED: PrivilegedAuthFailure = {
  error: "Sessão não autenticada. Efetue login novamente.",
  status: 401,
};

const INACTIVE: PrivilegedAuthFailure = {
  error: "Esta conta está desativada.",
  status: 403,
};

const FORBIDDEN: PrivilegedAuthFailure = {
  error: "Você não possui permissão para executar esta operação.",
  status: 403,
};

const MFA_REQUIRED: PrivilegedAuthFailure = {
  error: "Verificação em duas etapas obrigatória.",
  status: 403,
  code: "MFA_REQUIRED",
};

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split(".");
  if (parts.length !== 3 || !parts[1]) return null;
  try {
    const padded = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padLen = (4 - (padded.length % 4)) % 4;
    const json = atob(`${padded}${"=".repeat(padLen)}`);
    const payload = JSON.parse(json) as unknown;
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) return null;
    return payload as Record<string, unknown>;
  } catch {
    return null;
  }
}

function asAal(value: unknown): AuthenticatorAssuranceLevel | null {
  return value === "aal1" || value === "aal2" ? value : null;
}

/** Lê somente o header Authorization. Headers `aal` / `x-aal` e o body são ignorados. */
export function extractAalFromRequest(req: {
  headers: { get(name: string): string | null };
}): AuthenticatorAssuranceLevel | null {
  const header = req.headers.get("Authorization") ?? req.headers.get("authorization");
  if (!header) return null;
  const match = header.match(/^Bearer\s+(\S+)/i);
  if (!match?.[1]) return null;
  const payload = decodeJwtPayload(match[1]);
  return asAal(payload?.aal);
}

/**
 * Decisão de acesso privilegiado. Ordem:
 * sessão → ativo → papel → AAL2 → tenant (quando informado).
 */
export function evaluatePrivilegedGate(
  input: PrivilegedGateInput,
): { ok: true } | PrivilegedAuthFailure {
  if (!input.hasUser) return UNAUTHENTICATED;
  if (!input.isActive) return INACTIVE;
  if (!input.roleAuthorized) return FORBIDDEN;
  if (input.aal !== "aal2") return MFA_REQUIRED;
  if (input.tenantAuthorized === false) return FORBIDDEN;
  return { ok: true };
}

/** SUPER_ADMIN de empresa não escolhe outro tenant; operador da plataforma (`null`) pode. */
export function isLockedTenantAllowed(
  lockedTenantId: string | null,
  requestedTenantId: unknown,
): boolean {
  if (!lockedTenantId) return true;
  if (typeof requestedTenantId !== "string" || requestedTenantId.length === 0) {
    return true;
  }
  return requestedTenantId === lockedTenantId;
}
