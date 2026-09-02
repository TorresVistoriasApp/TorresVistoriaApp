/** Quem é o autenticado — distinto do papel dentro do tenant (`UserRole`). */
export const PrincipalType = {
  /** Opera o SaaS: enxerga todos os tenants, não pertence a nenhum. */
  PLATFORM_ADMIN: "PLATFORM_ADMIN",
  /** Usuário de uma empresa cliente; sempre possui `tenant_id` e `UserRole`. */
  TENANT_MEMBER: "TENANT_MEMBER",
  /** Consumidor final (B2C do Torres Consulta). */
  CUSTOMER: "CUSTOMER",
  /** Vistoriador com cadastro público aguardando aprovação administrativa. */
  PENDING_INSPECTOR: "PENDING_INSPECTOR",
} as const;
export type PrincipalType = (typeof PrincipalType)[keyof typeof PrincipalType];

/** Subconjunto de `public.tenant_role` com UI ativa. */
export const UserRole = {
  SUPER_ADMIN: "SUPER_ADMIN",
  INSPECTOR: "INSPECTOR",
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

/** Códigos já no enum `public.tenant_role`, sem UI ainda. */
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

/** Papéis B2C — fora de `TenantRoleCode` (o enum do banco não os aceita). */
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
