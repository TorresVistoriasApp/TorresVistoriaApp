import type { UserRole, UserStatus } from "@/core/rbac/roles";

/** Status da conta do consumidor B2C (coluna `account_status` de `consumer_profiles`). */
export const ConsumerAccountStatus = {
  ACTIVE: "active",
  PENDING_DELETION: "pending_deletion",
  DELETED: "deleted",
} as const;
export type ConsumerAccountStatus =
  (typeof ConsumerAccountStatus)[keyof typeof ConsumerAccountStatus];

/** Status do cadastro de vistoriador em análise (coluna `status` de `inspector_registrations`). */
export const InspectorRegistrationStatus = {
  PENDING_APPROVAL: "pending_approval",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const;
export type InspectorRegistrationStatus =
  (typeof InspectorRegistrationStatus)[keyof typeof InspectorRegistrationStatus];

/** Cadastro público de vistoriador aguardando aprovação administrativa. */
export interface InspectorRegistration {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  document_type: "cpf" | "cnpj";
  document_hash: string;
  document_tail: string;
  status: InspectorRegistrationStatus;
  rejection_reason: string | null;
  approved_tenant_id: string | null;
  approved_role: string | null;
  approved_by: string | null;
  approved_at: string | null;
  rejected_at: string | null;
  created_at: string;
  updated_at: string;
}

/** Perfil do consumidor final (Torres Consulta B2C). Separado de `profiles`. */
export interface ConsumerProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  account_status: ConsumerAccountStatus;
  deletion_requested_at: string | null;
  deletion_scheduled_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

/** Perfil do usuário dentro de um tenant. */
export interface Profile {
  id: string;
  /** Espelho gerado de `id` (sempre igual). Ver comentário na migration da Etapa 2. */
  auth_user_id: string;
  tenant_id: string;
  full_name: string;
  role: UserRole;
  avatar_url: string | null;
  email: string | null;
  phone: string | null;
  is_active: boolean;
  status: UserStatus;
  must_change_password: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

/** Operador da plataforma: atua acima dos tenants, sem `tenant_id`. */
export interface PlatformAdmin {
  id: string;
  full_name: string;
  email: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}
