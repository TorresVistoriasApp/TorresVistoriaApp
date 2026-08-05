export type { Database, Json } from "./database";

export type {
  UserRole,
  UserStatus,
  InspectionSituation,
  InspectionOpinion,
  InspectionStatus,
  ChecklistStatus,
  FinancialEntryType,
} from "@/lib/enums";

export interface Profile {
  id: string;
  /** Espelho gerado de `id` (sempre igual). Ver comentário na migration da Etapa 2. */
  auth_user_id: string;
  company_id: string;
  full_name: string;
  role: import("@/lib/enums").UserRole;
  avatar_url: string | null;
  email: string | null;
  phone: string | null;
  is_active: boolean;
  status: import("@/lib/enums").UserStatus;
  must_change_password: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface PlatformAdmin {
  id: string;
  full_name: string;
  email: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface DashboardMetrics {
  totalInspections: number;
  totalRevenue: number;
  netProfit: number;
  averageTicket: number;
}
