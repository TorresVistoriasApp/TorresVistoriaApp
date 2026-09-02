import { ROUTE_SLUGS, ROUTES } from "@/config/routes";
import { PrincipalType } from "@/core/rbac/roles";

/**
 * Casas canônicas de cada painel do ecossistema.
 *
 * Toda decisão de "para onde essa identidade deve ir" passa por aqui, para que
 * um consumidor nunca caia no dashboard da empresa e um vistoriador nunca caia
 * no app B2C.
 */
export const PANEL_HOME = {
  marketing: ROUTES.consultaLanding,
  consumer: ROUTES.consultaApp,
  tenant: ROUTES.dashboard,
  platform: ROUTES.adminCompanies,
  pendingInspector: ROUTES.vistoriaPendingApproval,
} as const;

export const PANEL_AUTH = {
  consumer: ROUTES.consultaLogin,
  tenant: ROUTES.login,
} as const;

function isUnder(pathname: string, base: string): boolean {
  return pathname === base || pathname.startsWith(`${base}/`);
}

const CONSUMER_LEGACY: Record<string, string> = {
  [ROUTES.cliente]: ROUTES.consultaApp,
  [ROUTES.clienteLogin]: ROUTES.consultaLogin,
  [ROUTES.clienteRegister]: ROUTES.consultaRegister,
  [ROUTES.clienteForgotPassword]: ROUTES.consultaForgotPassword,
  [ROUTES.clienteResetPassword]: ROUTES.consultaResetPassword,
  [ROUTES.clienteDashboard]: ROUTES.consultaApp,
  [ROUTES.clienteConsultas]: ROUTES.consultaAppConsultas,
  [ROUTES.clienteProfile]: ROUTES.consultaAppMinhaConta,
  [ROUTES.clienteSettings]: ROUTES.consultaAppMinhaConta,
};

const TENANT_APP_ROOTS = [
  ROUTES.dashboard,
  ROUTES.inspections,
  ROUTES.financial,
  ROUTES.reports,
  ROUTES.settings,
  ROUTES.users,
  ROUTES.audit,
  ROUTES.changePassword,
  ROUTES.consultaNew,
  ROUTES.consultaHistory,
  ROUTES.consultaServices,
] as const;

export function homeForPrincipal(principalType: PrincipalType | null | undefined): string {
  switch (principalType) {
    case PrincipalType.CUSTOMER:
      return PANEL_HOME.consumer;
    case PrincipalType.TENANT_MEMBER:
      return PANEL_HOME.tenant;
    case PrincipalType.PLATFORM_ADMIN:
      return PANEL_HOME.platform;
    case PrincipalType.PENDING_INSPECTOR:
      return PANEL_HOME.pendingInspector;
    default:
      return PANEL_HOME.marketing;
  }
}

/** Entrada do produto Consulta: cada painel cai na área certa, anônimo vai à landing. */
export function consultaEntryForPrincipal(principalType: PrincipalType | null | undefined): string {
  if (principalType === PrincipalType.TENANT_MEMBER) return ROUTES.consultaNew;
  if (principalType === PrincipalType.CUSTOMER) return ROUTES.consultaApp;
  return homeForPrincipal(principalType);
}

export function canonicalizePath(pathname: string): string {
  if (CONSUMER_LEGACY[pathname]) return CONSUMER_LEGACY[pathname];
  if (pathname === ROUTES.admin) return ROUTES.adminCompanies;
  if (pathname === ROUTES.vistoriaLogin) return ROUTES.login;
  if (pathname === ROUTES.legacySettingsUsers) return ROUTES.users;
  if (pathname === ROUTES.legacySettingsAudit) return ROUTES.audit;
  if (pathname === ROUTES.consulta) return ROUTES.consultaLanding;
  return pathname;
}

export function isConsumerAppPath(pathname: string): boolean {
  return isUnder(pathname, ROUTES.consultaApp) || isUnder(pathname, `/${ROUTE_SLUGS.cliente}`);
}

export function isConsumerAuthPath(pathname: string): boolean {
  return (
    pathname === ROUTES.consultaLogin ||
    pathname === ROUTES.consultaRegister ||
    pathname === ROUTES.consultaForgotPassword ||
    pathname === ROUTES.consultaResetPassword ||
    pathname === ROUTES.cliente ||
    pathname === ROUTES.clienteLogin ||
    pathname === ROUTES.clienteRegister ||
    pathname === ROUTES.clienteForgotPassword ||
    pathname === ROUTES.clienteResetPassword
  );
}

export function isPlatformPath(pathname: string): boolean {
  return isUnder(pathname, ROUTES.admin);
}

export function isTenantAuthPath(pathname: string): boolean {
  return (
    pathname === ROUTES.login ||
    pathname === ROUTES.forgotPassword ||
    pathname === ROUTES.resetPassword ||
    pathname === ROUTES.vistoriaLogin ||
    pathname === ROUTES.vistoriaRegister ||
    pathname === ROUTES.vistoriaPendingApproval
  );
}

export function isTenantAppPath(pathname: string): boolean {
  if (isConsumerAppPath(pathname) || isConsumerAuthPath(pathname) || isPlatformPath(pathname)) {
    return false;
  }
  if (TENANT_APP_ROOTS.some((root) => isUnder(pathname, root))) return true;
  if (pathname === ROUTES.consulta) return false;
  return isUnder(pathname, ROUTES.consulta);
}

export function pathBelongsToPrincipal(
  pathname: string,
  principalType: PrincipalType,
): boolean {
  const path = canonicalizePath(pathname);
  switch (principalType) {
    case PrincipalType.CUSTOMER:
      return isConsumerAppPath(path);
    case PrincipalType.TENANT_MEMBER:
      return isTenantAppPath(path);
    case PrincipalType.PLATFORM_ADMIN:
      return isPlatformPath(path);
    case PrincipalType.PENDING_INSPECTOR:
      return path === ROUTES.vistoriaPendingApproval;
    default:
      return false;
  }
}

type LocationLike = { pathname?: string; search?: string } | string | null | undefined;

export function resolvePostAuthPath(
  principalType: PrincipalType | null | undefined,
  from?: LocationLike,
): string {
  const home = homeForPrincipal(principalType);
  if (!principalType) return home;

  const pathname = typeof from === "string" ? from : from?.pathname;
  const search = typeof from === "string" ? "" : (from?.search ?? "");
  if (!pathname) return home;

  const canonical = canonicalizePath(pathname);
  if (!pathBelongsToPrincipal(canonical, principalType)) return home;
  return `${canonical}${search}`;
}
