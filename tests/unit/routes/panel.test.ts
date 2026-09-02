import { describe, expect, it } from "vitest";
import { ROUTES } from "@/config/routes";
import { PrincipalType } from "@/core/rbac/roles";
import {
  canonicalizePath,
  consultaEntryForPrincipal,
  homeForPrincipal,
  isConsumerAppPath,
  isTenantAppPath,
  pathBelongsToPrincipal,
  resolvePostAuthPath,
} from "@/routes/panel";

describe("homeForPrincipal", () => {
  it("manda cada identidade para o painel dela", () => {
    expect(homeForPrincipal(PrincipalType.CUSTOMER)).toBe(ROUTES.consultaApp);
    expect(homeForPrincipal(PrincipalType.TENANT_MEMBER)).toBe(ROUTES.dashboard);
    expect(homeForPrincipal(PrincipalType.PLATFORM_ADMIN)).toBe(ROUTES.adminCompanies);
    expect(homeForPrincipal(PrincipalType.PENDING_INSPECTOR)).toBe(ROUTES.vistoriaPendingApproval);
    expect(homeForPrincipal(null)).toBe(ROUTES.consultaLanding);
  });
});

describe("consultaEntryForPrincipal", () => {
  it("separa consulta B2B, B2C e marketing", () => {
    expect(consultaEntryForPrincipal(PrincipalType.TENANT_MEMBER)).toBe(ROUTES.consultaNew);
    expect(consultaEntryForPrincipal(PrincipalType.CUSTOMER)).toBe(ROUTES.consultaApp);
    expect(consultaEntryForPrincipal(null)).toBe(ROUTES.consultaLanding);
  });
});

describe("classificação de paths", () => {
  it("reconhece o app do consumidor e o legado /cliente", () => {
    expect(isConsumerAppPath(ROUTES.consultaApp)).toBe(true);
    expect(isConsumerAppPath(ROUTES.consultaAppConsultas)).toBe(true);
    expect(isConsumerAppPath(ROUTES.clienteDashboard)).toBe(true);
    expect(isConsumerAppPath(ROUTES.consultaNew)).toBe(false);
    expect(isConsumerAppPath(ROUTES.dashboard)).toBe(false);
  });

  it("reconhece o painel da empresa sem misturar com o app B2C", () => {
    expect(isTenantAppPath(ROUTES.dashboard)).toBe(true);
    expect(isTenantAppPath(ROUTES.consultaNew)).toBe(true);
    expect(isTenantAppPath(ROUTES.consultaHistory)).toBe(true);
    expect(isTenantAppPath(ROUTES.consultaServices)).toBe(true);
    expect(isTenantAppPath(ROUTES.consultaDetail("abc-123"))).toBe(true);
    expect(isTenantAppPath(ROUTES.consultaApp)).toBe(false);
    expect(isTenantAppPath(ROUTES.consultaLogin)).toBe(false);
    expect(isTenantAppPath(ROUTES.adminCompanies)).toBe(false);
  });
});

describe("canonicalizePath", () => {
  it("promove URLs legadas à canônica do painel", () => {
    expect(canonicalizePath(ROUTES.clienteDashboard)).toBe(ROUTES.consultaApp);
    expect(canonicalizePath(ROUTES.clienteSettings)).toBe(ROUTES.consultaAppMinhaConta);
    expect(canonicalizePath(ROUTES.admin)).toBe(ROUTES.adminCompanies);
    expect(canonicalizePath(ROUTES.vistoriaLogin)).toBe(ROUTES.login);
  });
});

describe("resolvePostAuthPath", () => {
  it("aceita retorno somente dentro do painel da identidade", () => {
    expect(
      resolvePostAuthPath(PrincipalType.CUSTOMER, { pathname: ROUTES.consultaAppConsultas }),
    ).toBe(ROUTES.consultaAppConsultas);
    expect(resolvePostAuthPath(PrincipalType.CUSTOMER, { pathname: ROUTES.dashboard })).toBe(
      ROUTES.consultaApp,
    );
    expect(
      resolvePostAuthPath(PrincipalType.TENANT_MEMBER, { pathname: ROUTES.inspections }),
    ).toBe(ROUTES.inspections);
    expect(
      resolvePostAuthPath(PrincipalType.TENANT_MEMBER, { pathname: ROUTES.consultaApp }),
    ).toBe(ROUTES.dashboard);
    expect(
      resolvePostAuthPath(PrincipalType.PLATFORM_ADMIN, { pathname: ROUTES.admin }),
    ).toBe(ROUTES.adminCompanies);
  });

  it("preserva a querystring quando o destino é do painel certo", () => {
    expect(
      resolvePostAuthPath(PrincipalType.TENANT_MEMBER, {
        pathname: ROUTES.inspections,
        search: "?placa=ABC1D23",
      }),
    ).toBe(`${ROUTES.inspections}?placa=ABC1D23`);
  });

  it("mapeia legado de cliente para o app canônico", () => {
    expect(pathBelongsToPrincipal(ROUTES.clienteConsultas, PrincipalType.CUSTOMER)).toBe(true);
    expect(
      resolvePostAuthPath(PrincipalType.CUSTOMER, { pathname: ROUTES.clienteConsultas }),
    ).toBe(ROUTES.consultaAppConsultas);
  });
});
