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
  changePassword: "trocar-senha",
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
  users: route(ROUTE_SLUGS.users),
  audit: route(ROUTE_SLUGS.audit),
  legacySettingsUsers: settingsRoute(ROUTE_SLUGS.users),
  legacySettingsAudit: settingsRoute(ROUTE_SLUGS.audit),
  changePassword: route(ROUTE_SLUGS.changePassword),
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

export {
  PHOTO_CATALOG,
  PHOTO_CATEGORIES,
  PHOTO_CATEGORY_KEYS,
  PHOTO_CATEGORY_LABELS,
  MANDATORY_PHOTO_CATEGORY_KEYS as MANDATORY_PHOTO_CATEGORIES,
  OPTIONAL_PHOTO_CATEGORY_KEYS as OPTIONAL_PHOTO_CATEGORIES,
  PAINT_PHOTO_CATEGORY_KEYS as PAINT_PHOTO_CATEGORIES,
  getPhotoCategoryLabel,
  normalizePhotoCategory,
  photoMatchesCategory,
} from "@/lib/photos/photo-catalog";
