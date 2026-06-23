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
export const DEFAULT_PRIMARY_COLOR = "#1e40af";
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

export const CHECKLIST_CATEGORIES = {
  ESTRUTURA: ["Longarinas", "Painéis", "Torres", "Colunas", "Teto", "Caixa de ar", "Assoalho"],
  PINTURA: ["Original", "Repintura", "Repintura com massa", "Avariado"],
  VIDROS: ["Original", "Substituído"],
  IDENTIFICACAO: ["Chassi", "Motor", "Etiquetas", "Plaquetas"],
  MECANICA: ["Suspensão", "Direção", "Freios"],
} as const;

export const PHOTO_CATEGORIES = [
  "FRENTE_45", "TRASEIRA_45", "LATERAL_DIREITA", "LATERAL_ESQUERDA",
  "MOTOR", "CHASSI", "PAINEL", "HODOMETRO", "ESTRUTURA", "VIDROS",
  "ETIQUETAS", "DANOS", "EXTRAS",
] as const;
