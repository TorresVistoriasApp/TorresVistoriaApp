import { describe, expect, it } from "vitest";
import {
  isTenantId,
  resolveTenant,
  resolvedTenantId,
  tenantIdFromAppMetadata,
  tenantSlugFromHostname,
} from "@/core/tenant/tenant-resolver";

const TENANT_A = "11111111-1111-4111-8111-111111111111";
const TENANT_B = "22222222-2222-4222-8222-222222222222";

describe("resolveTenant", () => {
  it("sem sessão é anônimo", () => {
    const result = resolveTenant({
      hasSession: false,
      isPlatformAdmin: false,
      sessionTenantId: TENANT_A,
    });
    expect(result.status).toBe("anonymous");
    expect(resolvedTenantId(result)).toBeNull();
  });

  it("resolve o tenant do perfil da sessão", () => {
    const result = resolveTenant({
      hasSession: true,
      isPlatformAdmin: false,
      sessionTenantId: TENANT_A,
    });
    expect(result).toEqual({ status: "resolved", tenantId: TENANT_A, source: "session" });
  });

  it("operador da plataforma não recebe tenant", () => {
    const result = resolveTenant({
      hasSession: true,
      isPlatformAdmin: true,
      sessionTenantId: null,
    });
    expect(result.status).toBe("platform-admin");
    expect(resolvedTenantId(result)).toBeNull();
  });

  it("sessão sem empresa vinculada é missing-tenant", () => {
    const result = resolveTenant({
      hasSession: true,
      isPlatformAdmin: false,
      sessionTenantId: null,
    });
    expect(result.status).toBe("missing-tenant");
  });

  it("override tem precedência sobre a sessão", () => {
    const result = resolveTenant({
      hasSession: true,
      isPlatformAdmin: false,
      sessionTenantId: TENANT_A,
      overrideTenantId: TENANT_B,
    });
    expect(result).toEqual({ status: "resolved", tenantId: TENANT_B, source: "override" });
  });

  it("ignora tenant que não é UUID", () => {
    const result = resolveTenant({
      hasSession: true,
      isPlatformAdmin: false,
      sessionTenantId: "empresa-a",
    });
    expect(result.status).toBe("missing-tenant");
  });

  it("override inválido não escala para tenant", () => {
    const result = resolveTenant({
      hasSession: true,
      isPlatformAdmin: true,
      sessionTenantId: null,
      overrideTenantId: "'; DROP TABLE inspections; --",
    });
    expect(result.status).toBe("platform-admin");
  });
});

describe("tenantIdFromAppMetadata", () => {
  it("lê tenant_id do JWT", () => {
    expect(tenantIdFromAppMetadata({ tenant_id: TENANT_A })).toBe(TENANT_A);
  });

  it("aceita company_id legado quando tenant_id não veio", () => {
    expect(tenantIdFromAppMetadata({ company_id: TENANT_B })).toBe(TENANT_B);
  });

  it("prefere tenant_id quando os dois existem", () => {
    expect(
      tenantIdFromAppMetadata({ tenant_id: TENANT_A, company_id: TENANT_B }),
    ).toBe(TENANT_A);
  });

  it("ignora metadata ausente ou inválida", () => {
    expect(tenantIdFromAppMetadata(undefined)).toBeNull();
    expect(tenantIdFromAppMetadata({ tenant_id: "empresa-a" })).toBeNull();
  });
});

describe("isTenantId", () => {
  it("aceita apenas UUID", () => {
    expect(isTenantId(TENANT_A)).toBe(true);
    expect(isTenantId("")).toBe(false);
    expect(isTenantId(null)).toBe(false);
    expect(isTenantId(123)).toBe(false);
    expect(isTenantId("11111111-1111-4111-8111")).toBe(false);
  });
});

describe("tenantSlugFromHostname", () => {
  it("extrai o slug do subdomínio", () => {
    expect(tenantSlugFromHostname("empresa-a.torresapp.com", "torresapp.com")).toBe("empresa-a");
  });

  it("ignora apex, www e hosts de desenvolvimento", () => {
    expect(tenantSlugFromHostname("torresapp.com", "torresapp.com")).toBeNull();
    expect(tenantSlugFromHostname("www.torresapp.com", "torresapp.com")).toBeNull();
    expect(tenantSlugFromHostname("localhost", "torresapp.com")).toBeNull();
    expect(tenantSlugFromHostname("127.0.0.1", "torresapp.com")).toBeNull();
  });

  it("ignora subdomínio aninhado e host de outro domínio", () => {
    expect(tenantSlugFromHostname("a.b.torresapp.com", "torresapp.com")).toBeNull();
    expect(tenantSlugFromHostname("empresa-a.outrodominio.com", "torresapp.com")).toBeNull();
  });
});
