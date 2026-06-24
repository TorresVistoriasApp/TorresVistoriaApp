export const APP_NAME = "Torres Vistoria";
export const APP_VERSION = "0.1.0";
export const DEFAULT_PRIMARY_COLOR = "#ea580c";
export const DEFAULT_COMPANY_ID = "00000000-0000-4000-8000-000000000001";

export const ROUTE_SLUGS = {
  login: "login",
  forgotPassword: "recuperar-senha",
  resetPassword: "redefinir-senha",
  privacy: "privacidade",
  validate: "validar",
  inspections: "vistorias",
  new: "nova",
  edit: "editar",
  photos: "fotos",
  checklist: "checklist",
  report: "laudo",
  financial: "financeiro",
  revenue: "receitas",
  expenses: "despesas",
  reports: "relatorios",
  settings: "configuracoes",
  company: "empresa",
  profile: "perfil",
  users: "usuarios",
  audit: "auditoria",
} as const;

const route = (...segments: string[]) => `/${segments.join("/")}`;

const inspectionRoute = (id: string) => route(ROUTE_SLUGS.inspections, encodeURIComponent(id));
const settingsRoute = (slug: string) => route(ROUTE_SLUGS.settings, slug);
const financialRoute = (slug: string) => route(ROUTE_SLUGS.financial, slug);

export const ROUTES = {
  login: route(ROUTE_SLUGS.login),
  forgotPassword: route(ROUTE_SLUGS.forgotPassword),
  resetPassword: route(ROUTE_SLUGS.resetPassword),
  dashboard: "/",
  legacyDashboard: route("dashboard"),
  privacy: route(ROUTE_SLUGS.privacy),
  validateReport: (code: string) => route(ROUTE_SLUGS.validate, encodeURIComponent(code)),
  inspections: route(ROUTE_SLUGS.inspections),
  inspectionNew: route(ROUTE_SLUGS.inspections, ROUTE_SLUGS.new),
  inspection: inspectionRoute,
  inspectionEdit: (id: string) => route(ROUTE_SLUGS.inspections, encodeURIComponent(id), ROUTE_SLUGS.edit),
  inspectionPhotos: (id: string) => route(ROUTE_SLUGS.inspections, encodeURIComponent(id), ROUTE_SLUGS.photos),
  inspectionChecklist: (id: string) =>
    route(ROUTE_SLUGS.inspections, encodeURIComponent(id), ROUTE_SLUGS.checklist),
  inspectionReport: (id: string) =>
    route(ROUTE_SLUGS.inspections, encodeURIComponent(id), ROUTE_SLUGS.report),
  financial: route(ROUTE_SLUGS.financial),
  financialRevenue: financialRoute(ROUTE_SLUGS.revenue),
  financialExpenses: financialRoute(ROUTE_SLUGS.expenses),
  reports: route(ROUTE_SLUGS.reports),
  settings: route(ROUTE_SLUGS.settings),
  settingsCompany: settingsRoute(ROUTE_SLUGS.company),
  settingsProfile: settingsRoute(ROUTE_SLUGS.profile),
  settingsUsers: settingsRoute(ROUTE_SLUGS.users),
  settingsAudit: settingsRoute(ROUTE_SLUGS.audit),
} as const;

export const ROUTE_PATTERNS = {
  validateReport: route(ROUTE_SLUGS.validate, ":codigo"),
  inspection: route(ROUTE_SLUGS.inspections, ":id"),
  inspectionEdit: route(ROUTE_SLUGS.inspections, ":id", ROUTE_SLUGS.edit),
  inspectionPhotos: route(ROUTE_SLUGS.inspections, ":id", ROUTE_SLUGS.photos),
  inspectionChecklist: route(ROUTE_SLUGS.inspections, ":id", ROUTE_SLUGS.checklist),
  inspectionReport: route(ROUTE_SLUGS.inspections, ":id", ROUTE_SLUGS.report),
} as const;

export const NEW_INSPECTION_FLOW_QUERY = "fluxo=nova";

export function withNewInspectionFlow(path: string): string {
  return `${path}?${NEW_INSPECTION_FLOW_QUERY}`;
}

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
  "PINTURA_CAPO",
  "PINTURA_TETO",
  "PINTURA_TAMPA_PORTA_MALAS",
  "PINTURA_PARALAMA_DIANTEIRO_ESQUERDO",
  "PINTURA_PORTA_DIANTEIRA_ESQUERDA",
  "PINTURA_PORTA_TRASEIRA_ESQUERDA",
  "PINTURA_TRASEIRA_ESQUERDA",
  "PINTURA_TRASEIRA_DIREITA",
  "PINTURA_PORTA_TRASEIRA_DIREITA",
  "PINTURA_PORTA_DIANTEIRA_DIREITA",
  "PINTURA_PARALAMA_DIANTEIRO_DIREITO",
  "PINTURA_PARACHOQUE_DIANTEIRO",
  "PINTURA_PARACHOQUE_TRASEIRO",
  "EXTRAS",
] as const;

export const OPTIONAL_PHOTO_CATEGORIES = ["DOCUMENTOS", "EXTRAS"] as const;

export const MANDATORY_PHOTO_CATEGORIES = PHOTO_CATEGORIES.filter(
  (category) => !(OPTIONAL_PHOTO_CATEGORIES as readonly string[]).includes(category),
);

export const PAINT_PHOTO_CATEGORIES = [
  "PINTURA_CAPO",
  "PINTURA_TETO",
  "PINTURA_TAMPA_PORTA_MALAS",
  "PINTURA_PARALAMA_DIANTEIRO_ESQUERDO",
  "PINTURA_PORTA_DIANTEIRA_ESQUERDA",
  "PINTURA_PORTA_TRASEIRA_ESQUERDA",
  "PINTURA_TRASEIRA_ESQUERDA",
  "PINTURA_TRASEIRA_DIREITA",
  "PINTURA_PORTA_TRASEIRA_DIREITA",
  "PINTURA_PORTA_DIANTEIRA_DIREITA",
  "PINTURA_PARALAMA_DIANTEIRO_DIREITO",
  "PINTURA_PARACHOQUE_DIANTEIRO",
  "PINTURA_PARACHOQUE_TRASEIRO",
] as const;
