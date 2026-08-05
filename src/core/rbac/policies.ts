import { hasPermission, type Permission } from "@/core/rbac/permissions";
import { ASSIGNABLE_ROLES, UserRole } from "@/core/rbac/roles";

/**
 * Regras de negócio de acesso que combinam mais de uma permissão ou dependem de
 * dados do recurso. Ficam aqui — e não dentro das telas — para que a resposta a
 * "por que este botão sumiu?" esteja sempre no mesmo lugar.
 */

/** Escopo de leitura aplicado a listagens do tenant. */
export const AccessScope = {
  /** Enxerga todos os registros da empresa. */
  COMPANY: "COMPANY",
  /** Enxerga apenas os próprios registros. */
  OWN: "OWN",
  /** Sem acesso ao recurso. */
  NONE: "NONE",
} as const;
export type AccessScope = (typeof AccessScope)[keyof typeof AccessScope];

function resolveScope(
  role: UserRole | undefined,
  allPermission: Permission,
  ownPermission: Permission,
): AccessScope {
  if (hasPermission(role, allPermission)) return AccessScope.COMPANY;
  if (hasPermission(role, ownPermission)) return AccessScope.OWN;
  return AccessScope.NONE;
}

/** Alcance do usuário sobre as vistorias da empresa. */
export function inspectionScope(role: UserRole | undefined): AccessScope {
  return resolveScope(role, "inspections.read.all", "inspections.read.own");
}

/** Alcance do usuário sobre os lançamentos financeiros. */
export function financialScope(role: UserRole | undefined): AccessScope {
  return resolveScope(role, "financial.manage", "financial.read.own");
}

/** Alcance do usuário sobre as consultas veiculares. */
export function consultaScope(role: UserRole | undefined): AccessScope {
  return resolveScope(role, "consulta.read.all", "consulta.read.own");
}

/**
 * Papéis que o usuário atual pode atribuir a outro membro.
 *
 * Hoje só quem administra usuários atribui papéis, e pode atribuir qualquer um
 * dos ativos. Quando `OWNER`/`MANAGER` entrarem em operação, a hierarquia de
 * quem promove quem é expressa aqui.
 */
export function assignableRoles(role: UserRole | undefined): readonly UserRole[] {
  return hasPermission(role, "users.manage") ? ASSIGNABLE_ROLES : [];
}

/** Um usuário nunca pode desativar ou rebaixar a si mesmo. */
export function canManageUser(
  role: UserRole | undefined,
  actorUserId: string | undefined,
  targetUserId: string,
): boolean {
  if (!hasPermission(role, "users.manage")) return false;
  return actorUserId !== targetUserId;
}

/** Rótulo de destaque para o papel de maior privilégio ativo. */
export function isPrivilegedRole(role: string | undefined): boolean {
  return role === UserRole.SUPER_ADMIN;
}
