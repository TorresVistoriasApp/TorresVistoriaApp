/**
 * Catálogo de identidades e papéis do Ecossistema Torres.
 *
 * O modelo separa **quem é** o autenticado (`PrincipalType`) de **o que ele
 * pode fazer dentro de um tenant** (`UserRole`). Essa separação existe porque
 * nem toda identidade pertence a uma empresa: o operador do SaaS atua acima dos
 * tenants e o cliente final do Torres Consulta não pertence a nenhum.
 */

/** Natureza da identidade autenticada. Determina em qual área ela navega. */
export const PrincipalType = {
  /** Opera o SaaS: enxerga todos os tenants, não pertence a nenhum. */
  PLATFORM_ADMIN: "PLATFORM_ADMIN",
  /** Usuário de uma empresa cliente; sempre possui `company_id` e `UserRole`. */
  TENANT_MEMBER: "TENANT_MEMBER",
  /** Consumidor final (B2C do Torres Consulta). Reservado — ainda sem persistência. */
  CUSTOMER: "CUSTOMER",
} as const;
export type PrincipalType = (typeof PrincipalType)[keyof typeof PrincipalType];

/**
 * Papéis de tenant com permissões e UI ativas hoje.
 *
 * Corresponde a um subconjunto do enum PostgreSQL `public.tenant_role`.
 */
export const UserRole = {
  SUPER_ADMIN: "SUPER_ADMIN",
  INSPECTOR: "INSPECTOR",
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

/**
 * Papéis já reservados no enum `public.tenant_role`, sem permissões nem UI.
 *
 * Ativar um deles é uma mudança local: adicioná-lo a `UserRole` e incluí-lo nas
 * entradas desejadas da matriz em `@/core/rbac/permissions`.
 */
export const FutureUserRole = {
  /** Gestão financeira sem acesso operacional à vistoria. */
  FINANCIAL: "FINANCIAL",
  /** Gestor de equipe: visão da empresa sem controle de faturamento. */
  MANAGER: "MANAGER",
  /** Consulta sem escrita. */
  READ_ONLY: "READ_ONLY",
  /** Suporte interno com acesso assistido. */
  SUPPORT: "SUPPORT",
  /** Proprietário da empresa contratante — o perfil "EMPRESA" do negócio. */
  OWNER: "OWNER",
} as const;
export type FutureUserRole = (typeof FutureUserRole)[keyof typeof FutureUserRole];

/** União de todos os códigos aceitos pelo enum `public.tenant_role`. */
export type TenantRoleCode = UserRole | FutureUserRole;

/**
 * Papéis de identidades que não pertencem a um tenant.
 *
 * Reservado para o Torres Consulta B2C. Deliberadamente fora de
 * `TenantRoleCode`: o enum do banco não os aceita, e persistir um cliente final
 * como membro de empresa quebraria o isolamento multi-tenant.
 */
export const CustomerRole = {
  /** Pessoa física ou jurídica que compra consultas avulsas. */
  CLIENT: "CLIENT",
} as const;
export type CustomerRole = (typeof CustomerRole)[keyof typeof CustomerRole];

/** Qualquer papel do ecossistema, ativo ou reservado. */
export type AnyRole = TenantRoleCode | CustomerRole;

/**
 * Status textual do usuário (coluna `status` de `profiles`), sincronizado no
 * banco com `is_active` (true <-> ACTIVE, false <-> INACTIVE/SUSPENDED).
 * SUSPENDED é reservado para bloqueio temporário, distinto de uma desativação
 * administrativa.
 */
export const UserStatus = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  SUSPENDED: "SUSPENDED",
} as const;
export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

/** Papéis que um administrador pode atribuir na interface hoje. */
export const ASSIGNABLE_ROLES: readonly UserRole[] = [UserRole.SUPER_ADMIN, UserRole.INSPECTOR];

/** Rótulos em português. O código interno permanece em inglês. */
export const ROLE_LABELS: Record<AnyRole, string> = {
  [UserRole.SUPER_ADMIN]: "Super Admin",
  [UserRole.INSPECTOR]: "Vistoriador",
  [FutureUserRole.FINANCIAL]: "Financeiro",
  [FutureUserRole.MANAGER]: "Gestor",
  [FutureUserRole.READ_ONLY]: "Somente leitura",
  [FutureUserRole.SUPPORT]: "Suporte",
  [FutureUserRole.OWNER]: "Empresa",
  [CustomerRole.CLIENT]: "Cliente",
};

export function getRoleLabel(role: string): string {
  return ROLE_LABELS[role as AnyRole] ?? role;
}
