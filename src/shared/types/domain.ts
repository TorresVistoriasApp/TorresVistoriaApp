export type UserRole = "SUPER_ADMIN" | "VISTORIADOR";

export type InspectionSituation =
  | "PARTICULAR"
  | "LOJA"
  | "LEILAO"
  | "RECUPERADO"
  | "SINISTRADO"
  | "ALIENADO";

export type InspectionOpinion =
  | "APROVADO"
  | "APROVADO_COM_OBSERVACOES"
  | "REPROVADO";

export type ChecklistStatus = "CONFORME" | "NAO_CONFORME" | "NA";

export type FinancialEntryType = "RECEITA" | "DESPESA" | "CUSTO";

export type PhotoCategory =
  | "FRENTE_45"
  | "TRASEIRA_45"
  | "LATERAL_DIREITA"
  | "LATERAL_ESQUERDA"
  | "MOTOR"
  | "CHASSI"
  | "PAINEL"
  | "HODOMETRO"
  | "ESTRUTURA"
  | "VIDROS"
  | "ETIQUETAS"
  | "DANOS"
  | "EXTRAS";

export interface Company {
  id: string;
  name: string;
  document: string | null;
  email: string | null;
  phone: string | null;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Profile {
  id: string;
  company_id: string;
  full_name: string;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Inspection {
  id: string;
  company_id: string;
  inspector_id: string;
  inspection_number: number;
  inspection_date: string;
  inspection_time: string;
  location: string;
  client_name: string;
  client_document: string;
  client_phone: string | null;
  client_email: string | null;
  plate: string;
  chassis: string;
  renavam: string | null;
  brand: string;
  model: string;
  version: string | null;
  color: string;
  fuel: string;
  manufacture_year: number;
  model_year: number;
  mileage: number | null;
  situation: InspectionSituation;
  opinion: InspectionOpinion | null;
  technical_notes: string | null;
  internal_notes: string | null;
  status: "DRAFT" | "COMPLETED" | "ARCHIVED";
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
