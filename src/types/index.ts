export type { Database, Json } from "./database";

export type {
  UserRole,
  InspectionSituation,
  InspectionOpinion,
  InspectionStatus,
  ChecklistStatus,
  FinancialEntryType,
} from "@/lib/enums";

export interface Profile {
  id: string;
  company_id: string;
  full_name: string;
  role: import("@/lib/enums").UserRole;
  avatar_url: string | null;
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
