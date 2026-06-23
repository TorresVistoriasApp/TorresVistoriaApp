export const UserRole = {
  SUPER_ADMIN: "SUPER_ADMIN",
  VISTORIADOR: "VISTORIADOR",
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const InspectionSituation = {
  PARTICULAR: "PARTICULAR",
  LOJA: "LOJA",
  LEILAO: "LEILAO",
  RECUPERADO: "RECUPERADO",
  SINISTRADO: "SINISTRADO",
  ALIENADO: "ALIENADO",
} as const;
export type InspectionSituation = (typeof InspectionSituation)[keyof typeof InspectionSituation];

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
