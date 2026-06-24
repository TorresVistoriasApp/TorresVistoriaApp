export const APP_NAME = "Torres Vistoria";
export const DEMO_USERS = {
  superAdmin: {
    email: "admin@torresvistorias.com.br",
    password: "TorresDemo2026!",
    label: "Super Admin — Torres Vistorias",
  },
  vistoriador: {
    email: "vistoriador@torresvistorias.com.br",
    password: "TorresDemo2026!",
    label: "Vistoriador",
  },
} as const;

export const IS_DEMO_MODE = import.meta.env.VITE_DEMO_MODE === "true";
export const APP_VERSION = "0.1.0";
export const DEFAULT_PRIMARY_COLOR = "#ea580c";
export const DEFAULT_COMPANY_ID = "00000000-0000-4000-8000-000000000001";
export const SUPABASE_PROJECT_ID = "ljzttzfjtskblxekmquu";

export const ROUTES = {
  login: "/login",
  forgotPassword: "/recuperar-senha",
  resetPassword: "/redefinir-senha",
  dashboard: "/",
  inspections: "/vistorias",
  inspectionNew: "/vistorias/nova",
  financial: "/financeiro",
  reports: "/relatorios",
  settings: "/configuracoes",
} as const;

export { CHECKLIST_CATEGORIES } from "@/lib/checklist-catalog";

export const PHOTO_CATEGORIES = [
  "FRENTE_45_DIREITA",
  "FRENTE_45_ESQUERDA",
  "TRASEIRA_45_DIREITA",
  "TRASEIRA_45_ESQUERDA",
  "LATERAL_DIREITA",
  "LATERAL_ESQUERDA",
  "PLACA_DIANTEIRA",
  "PLACA_TRASEIRA",
  "MOTOR",
  "MOTOR_NUMERO",
  "CHASSI",
  "PAINEL",
  "HODOMETRO",
  "ESTRUTURA_DIANTEIRA",
  "ESTRUTURA_TRASEIRA",
  "CAIXA_AR",
  "ASSOALHO_PORTA_MALAS",
  "VIDROS",
  "ETIQUETAS",
  "INTERIOR",
  "CINTOS_AIRBAGS",
  "DOCUMENTOS",
  "DANOS",
  "EXTRAS",
] as const;
