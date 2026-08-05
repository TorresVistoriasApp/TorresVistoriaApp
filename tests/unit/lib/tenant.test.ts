import { describe, expect, it } from "vitest";
import { requireTenantId, requireUserId } from "@/core/tenant/tenant";

describe("tenant helpers", () => {
  it("requireTenantId aceita id válido", () => {
    expect(requireTenantId("company-1")).toBe("company-1");
  });

  it("requireTenantId rejeita ausente", () => {
    expect(() => requireTenantId(null)).toThrow("empresa não carregada");
    expect(() => requireTenantId(undefined)).toThrow("empresa não carregada");
  });

  it("requireUserId rejeita ausente", () => {
    expect(() => requireUserId(null)).toThrow("usuário não autenticado");
  });
});
