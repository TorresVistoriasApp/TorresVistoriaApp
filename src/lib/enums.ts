/** Papéis ativos no tenant (Etapa 3). */
export const UserRole = {
  SUPER_ADMIN: "SUPER_ADMIN",
  INSPECTOR: "INSPECTOR",
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

/**
 * Papéis reservados para expansão futura do RBAC (sem permissões nem UI ainda).
 * Já existem no enum PostgreSQL `tenant_role` para facilitar migrations posteriores.
 */
export const FutureUserRole = {
  FINANCIAL: "FINANCIAL",
  MANAGER: "MANAGER",
  READ_ONLY: "READ_ONLY",
  SUPPORT: "SUPPORT",
  OWNER: "OWNER",
} as const;
export type FutureUserRole = (typeof FutureUserRole)[keyof typeof FutureUserRole];

/** União de todos os códigos de papel persistidos em `tenant_role`. */
export type TenantRoleCode = UserRole | FutureUserRole;

/**
 * Status textual do usuário (coluna `status` de `profiles`), sincronizado no
 * banco com `is_active` (true <-> ACTIVE, false <-> INACTIVE/SUSPENDED).
 * SUSPENDED é reservado para uso futuro (ex.: bloqueio temporário distinto de
 * uma desativação administrativa).
 */
export const UserStatus = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  SUSPENDED: "SUSPENDED",
} as const;
export type UserStatus = (typeof UserStatus)[keyof typeof UserStatus];

export const InspectionSituation = {
  PARTICULAR: "PARTICULAR",
  LOJA: "LOJA",
  LEILAO: "LEILAO",
  RECUPERADO: "RECUPERADO",
  SINISTRADO: "SINISTRADO",
  ALIENADO: "ALIENADO",
} as const;
export type InspectionSituation = (typeof InspectionSituation)[keyof typeof InspectionSituation];

export const InspectionPurpose = {
  CAUTELAR: "CAUTELAR",
  VENDA: "VENDA",
  DETRAN: "DETRAN",
  JUDICIAL: "JUDICIAL",
  SEGURADORA: "SEGURADORA",
  LEILAO: "LEILAO",
} as const;
export type InspectionPurpose = (typeof InspectionPurpose)[keyof typeof InspectionPurpose];

export const InspectionOpinion = {
  APROVADO: "APROVADO",
  APROVADO_COM_OBSERVACOES: "APROVADO_COM_OBSERVACOES",
  REPROVADO: "REPROVADO",
} as const;
export type InspectionOpinion = (typeof InspectionOpinion)[keyof typeof InspectionOpinion];

export const InspectionStatus = {
  DRAFT: "DRAFT",
  COMPLETED: "COMPLETED",
  ARCHIVED: "ARCHIVED",
} as const;
export type InspectionStatus = (typeof InspectionStatus)[keyof typeof InspectionStatus];

export const ChecklistStatus = {
  PENDENTE: "PENDENTE",
  CONFORME: "CONFORME",
  NAO_CONFORME: "NAO_CONFORME",
  NA: "NA",
} as const;
export type ChecklistStatus = (typeof ChecklistStatus)[keyof typeof ChecklistStatus];

export const FinancialEntryType = {
  RECEITA: "RECEITA",
  DESPESA: "DESPESA",
  CUSTO: "CUSTO",
} as const;
export type FinancialEntryType = (typeof FinancialEntryType)[keyof typeof FinancialEntryType];
