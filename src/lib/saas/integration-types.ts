/**
 * Contratos de integração externa (reservados — sem implementação ativa).
 * Cada provider terá service dedicado em `src/services/integrations/` no futuro.
 */

export const IntegrationProvider = {
  TORRES_CONSULTA: "torres_consulta",
  ERP: "erp",
  CRM: "crm",
  PUBLIC_API: "public_api",
  FLUTTER_MOBILE: "flutter_mobile",
  WEBHOOK: "webhook",
} as const;

export type IntegrationProvider =
  (typeof IntegrationProvider)[keyof typeof IntegrationProvider];

export const IntegrationStatus = {
  INACTIVE: "inactive",
  ACTIVE: "active",
  ERROR: "error",
} as const;

export type IntegrationStatus = (typeof IntegrationStatus)[keyof typeof IntegrationStatus];

export type IntegrationConnection = {
  id: string;
  companyId: string;
  provider: IntegrationProvider;
  status: IntegrationStatus;
  config: Record<string, unknown>;
  lastSyncAt: string | null;
};

/** Convite por e-mail (fluxo futuro — hoje `invite-user` cria usuário direto). */
export type TenantInvitation = {
  id: string;
  companyId: string;
  email: string;
  role: string;
  status: "pending" | "accepted" | "expired" | "revoked";
  expiresAt: string;
};

/** Filial do tenant (múltiplas unidades). */
export type CompanyBranch = {
  id: string;
  companyId: string;
  name: string;
  code: string | null;
  isHeadquarters: boolean;
};

/** Time operacional dentro do tenant. */
export type CompanyTeam = {
  id: string;
  companyId: string;
  branchId: string | null;
  name: string;
};

/** Assinatura recorrente (Stripe / gateway futuro). */
export type CompanySubscription = {
  id: string;
  companyId: string;
  planCode: string;
  status: "trialing" | "active" | "past_due" | "canceled";
  externalProvider: string | null;
  externalSubscriptionId: string | null;
  currentPeriodEnd: string | null;
};
