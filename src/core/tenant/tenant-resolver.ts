/**
 * Decide qual é o tenant ativo da requisição.
 *
 * Antes deste módulo a decisão estava espalhada como `tenantId ?? profile?.tenant_id
 * ?? null` em cada consumidor, o que tornava impossível responder "de onde veio o
 * tenant?" sem ler todos os call sites. Aqui a resposta é um único valor
 * discriminado, e quem consome é obrigado a tratar os casos em que não há tenant.
 *
 * A resolução por host existe como função pura e ainda NÃO está ligada ao fluxo:
 * mapear slug para tenant exige uma tabela de domínios que não existe no banco.
 * Quando existir, o único ponto a mudar é `resolveTenant`.
 */

export type TenantId = string;

export type TenantResolution =
  | { status: "resolved"; tenantId: TenantId; source: TenantSource }
  | { status: "anonymous" }
  | { status: "platform-admin" }
  | { status: "missing-tenant" };

export type TenantSource = "session" | "override";

export type TenantResolverInput = {
  hasSession: boolean;
  isPlatformAdmin: boolean;
  /** `profiles.tenant_id` do usuário autenticado. */
  sessionTenantId: string | null | undefined;
  /**
   * Tenant escolhido explicitamente. Reservado para operação da plataforma
   * (suporte atuando em nome de uma empresa) e ainda sem UI que o defina.
   */
  overrideTenantId?: string | null;
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isTenantId(value: unknown): value is TenantId {
  return typeof value === "string" && UUID_RE.test(value);
}

export function resolveTenant(input: TenantResolverInput): TenantResolution {
  if (!input.hasSession) {
    return { status: "anonymous" };
  }

  if (isTenantId(input.overrideTenantId)) {
    return { status: "resolved", tenantId: input.overrideTenantId, source: "override" };
  }

  // O operador da plataforma não pertence a empresa alguma; tratá-lo como
  // "sem tenant" faria a área do tenant renderizar com profile vazio.
  if (input.isPlatformAdmin) {
    return { status: "platform-admin" };
  }

  if (isTenantId(input.sessionTenantId)) {
    return { status: "resolved", tenantId: input.sessionTenantId, source: "session" };
  }

  return { status: "missing-tenant" };
}

/** Atalho para quem só precisa do id e trata ausência com null. */
export function resolvedTenantId(resolution: TenantResolution): TenantId | null {
  return resolution.status === "resolved" ? resolution.tenantId : null;
}

/**
 * Extrai o slug do tenant de um hostname, para o dia em que cada empresa tiver
 * subdomínio próprio. Ignora hosts de desenvolvimento e o apex do domínio.
 */
export function tenantSlugFromHostname(
  hostname: string,
  appHost: string,
): string | null {
  const host = hostname.trim().toLowerCase();
  const base = appHost.trim().toLowerCase();

  if (!host || !base || host === base) return null;
  if (host === "localhost" || host.endsWith(".localhost")) return null;
  if (UUID_RE.test(host) || /^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return null;
  if (!host.endsWith(`.${base}`)) return null;

  const slug = host.slice(0, -(base.length + 1));
  // Subdomínios de infraestrutura não representam tenant.
  if (!slug || slug === "www" || slug.includes(".")) return null;

  return slug;
}
