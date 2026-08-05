import type { UserRole, UserStatus } from "@/core/rbac/roles";

/** Perfil do usuário dentro de um tenant. */
export interface Profile {
  id: string;
  /** Espelho gerado de `id` (sempre igual). Ver comentário na migration da Etapa 2. */
  auth_user_id: string;
  company_id: string;
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

/** Operador da plataforma: atua acima dos tenants, sem `company_id`. */
export interface PlatformAdmin {
  id: string;
  full_name: string;
  email: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}
