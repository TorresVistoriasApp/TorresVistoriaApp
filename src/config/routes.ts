/**
 * Catálogo único de URLs da aplicação.
 *
 * Camada de configuração: não importa nada de `modules/` nem de `core/`, para
 * que qualquer módulo possa referenciar rotas sem criar acoplamento reverso.
 */

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
  admin: "admin",
  adminCompanies: "empresas",
  consulta: "consulta",
  consultaApp: "app",
  consultaNew: "nova",
  consultaHistory: "historico",
  consultaCredits: "creditos",
  consultaLogin: "login",
  consultaRegister: "cadastro",
  consultaForgotPassword: "esqueci-senha",
  consultaResetPassword: "redefinir-senha",
  cliente: "cliente",
  clienteLogin: "login",
  clienteRegister: "cadastro",
  clienteDashboard: "dashboard",
  clienteProfile: "perfil",
  clienteConsultas: "minhas-consultas",
  clienteSettings: "configuracoes",
  clienteForgotPassword: "recuperar-senha",
  clienteResetPassword: "redefinir-senha",
  vistoria: "vistoria",
  termos: "termos",
  lgpd: "lgpd",
  faq: "faq",
  relatorioExemplo: "relatorio-exemplo",
  sobre: "sobre",
  ajuda: "ajuda",
  contato: "contato",
  comoFunciona: "como-funciona",
  cookies: "cookies",
} as const;

const route = (...segments: string[]) => `/${segments.join("/")}`;

const inspectionRoute = (id: string) => route(ROUTE_SLUGS.inspections, encodeURIComponent(id));
const settingsRoute = (slug: string) => route(ROUTE_SLUGS.settings, slug);
const financialRoute = (slug: string) => route(ROUTE_SLUGS.financial, slug);
const consultaRoute = (slug: string) => route(ROUTE_SLUGS.consulta, slug);
const clienteRoute = (slug: string) => route(ROUTE_SLUGS.cliente, slug);

const consultaAppRoute = (...segments: string[]) =>
  route(ROUTE_SLUGS.consulta, ROUTE_SLUGS.consultaApp, ...segments);

export const ROUTES = {
  login: route(ROUTE_SLUGS.login),
  forgotPassword: route(ROUTE_SLUGS.forgotPassword),
  resetPassword: route(ROUTE_SLUGS.resetPassword),
  home: "/",
  dashboard: route("dashboard"),
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
  adminCompanies: route(ROUTE_SLUGS.admin, ROUTE_SLUGS.adminCompanies),
  adminInspectorRegistrations: route(ROUTE_SLUGS.admin, "cadastros-pendentes"),
  consulta: route(ROUTE_SLUGS.consulta),
  consultaNew: consultaRoute(ROUTE_SLUGS.consultaNew),
  consultaHistory: consultaRoute(ROUTE_SLUGS.consultaHistory),
  consultaCredits: consultaRoute(ROUTE_SLUGS.consultaCredits),
  consultaDetail: (id: string) => route(ROUTE_SLUGS.consulta, encodeURIComponent(id)),
  consultaLanding: "/",
  consultaLogin: route(ROUTE_SLUGS.consulta, ROUTE_SLUGS.consultaLogin),
  consultaRegister: route(ROUTE_SLUGS.consulta, ROUTE_SLUGS.consultaRegister),
  consultaForgotPassword: route(ROUTE_SLUGS.consulta, ROUTE_SLUGS.consultaForgotPassword),
  consultaResetPassword: route(ROUTE_SLUGS.consulta, ROUTE_SLUGS.consultaResetPassword),
  consultaApp: consultaAppRoute(),
  consultaAppConsultas: consultaAppRoute("consultas"),
  consultaAppNovaConsulta: consultaAppRoute("nova-consulta"),
  consultaAppMinhaConta: consultaAppRoute("minha-conta"),
  consultaAppConsultaDetail: (id: string) => consultaAppRoute("consultas", encodeURIComponent(id)),
  cliente: route(ROUTE_SLUGS.cliente),
  vistoriaLogin: route(ROUTE_SLUGS.vistoria, ROUTE_SLUGS.login),
  vistoriaRegister: route(ROUTE_SLUGS.vistoria, ROUTE_SLUGS.consultaRegister),
  vistoriaPendingApproval: route(ROUTE_SLUGS.vistoria, "aguardando-aprovacao"),
  clienteLogin: clienteRoute(ROUTE_SLUGS.clienteLogin),
  clienteRegister: clienteRoute(ROUTE_SLUGS.clienteRegister),
  clienteDashboard: clienteRoute(ROUTE_SLUGS.clienteDashboard),
  clienteProfile: clienteRoute(ROUTE_SLUGS.clienteProfile),
  clienteConsultas: clienteRoute(ROUTE_SLUGS.clienteConsultas),
  clienteSettings: clienteRoute(ROUTE_SLUGS.clienteSettings),
  clienteForgotPassword: clienteRoute(ROUTE_SLUGS.clienteForgotPassword),
  clienteResetPassword: clienteRoute(ROUTE_SLUGS.clienteResetPassword),
  termos: route(ROUTE_SLUGS.termos),
  lgpd: route(ROUTE_SLUGS.lgpd),
  faq: route(ROUTE_SLUGS.faq),
  relatorioExemplo: route(ROUTE_SLUGS.relatorioExemplo),
  sobre: route(ROUTE_SLUGS.sobre),
  ajuda: route(ROUTE_SLUGS.ajuda),
  contato: route(ROUTE_SLUGS.contato),
  comoFunciona: route(ROUTE_SLUGS.comoFunciona),
  cookies: route(ROUTE_SLUGS.cookies),
  planos: "/#planos",
  consultar: "/#consultar",
  vistoriadores: "/#vistoriadores",
} as const;

export const ROUTE_PATTERNS = {
  validateReport: route(ROUTE_SLUGS.validate, ":codigo"),
  inspection: route(ROUTE_SLUGS.inspections, ":id"),
  inspectionEdit: route(ROUTE_SLUGS.inspections, ":id", ROUTE_SLUGS.edit),
  inspectionPhotos: route(ROUTE_SLUGS.inspections, ":id", ROUTE_SLUGS.photos),
  inspectionChecklist: route(ROUTE_SLUGS.inspections, ":id", ROUTE_SLUGS.checklist),
  inspectionReport: route(ROUTE_SLUGS.inspections, ":id", ROUTE_SLUGS.report),
  consultaDetail: route(ROUTE_SLUGS.consulta, ":id"),
  consultaAppConsultaDetail: route(
    ROUTE_SLUGS.consulta,
    ROUTE_SLUGS.consultaApp,
    "consultas",
    ":id",
  ),
} as const;

export const NEW_INSPECTION_FLOW_QUERY = "fluxo=nova";

export function withNewInspectionFlow(path: string): string {
  return `${path}?${NEW_INSPECTION_FLOW_QUERY}`;
}
