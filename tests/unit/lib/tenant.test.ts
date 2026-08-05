import { describe, expect, it } from "vitest";
import { requireCompanyId, requireUserId } from "@/lib/tenant";

describe("tenant helpers", () => {
  it("requireCompanyId aceita id válido", () => {
    expect(requireCompanyId("company-1")).toBe("company-1");
  });

  it("requireCompanyId rejeita ausente", () => {
    expect(() => requireCompanyId(null)).toThrow("empresa não carregada");
    expect(() => requireCompanyId(undefined)).toThrow("empresa não carregada");
  });

  it("requireUserId rejeita ausente", () => {
    expect(() => requireUserId(null)).toThrow("usuário não autenticado");
  });
});
