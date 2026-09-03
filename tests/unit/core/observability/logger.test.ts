import { describe, expect, it } from "vitest";
import { redactLogMeta, redactPii } from "@/core/observability/logger";

describe("redactPii", () => {
  it("redige e-mail, CPF, CNPJ e JWT", () => {
    const input =
      "contato@empresa.com 123.456.789-09 12.345.678/0001-95 eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.aaaaaaaaaa.bbbbbbbbbb";
    const redacted = redactPii(input);
    expect(redacted).toContain("[redacted-email]");
    expect(redacted).toContain("[redacted-cpf]");
    expect(redacted).toContain("[redacted-cnpj]");
    expect(redacted).toContain("[redacted-token]");
    expect(redacted).not.toContain("contato@empresa.com");
    expect(redacted).not.toContain("123.456.789-09");
  });

  it("redige chaves de chassi, placa e service_role no meta", () => {
    const meta = redactLogMeta({
      chassis: "9BWZZZ377VT004251",
      plate: "ABC1D23",
      service_role: "ey-secret",
      inspectionId: "ok",
    }) as Record<string, unknown>;
    expect(meta.chassis).toBe("[redacted]");
    expect(meta.plate).toBe("[redacted]");
    expect(meta.service_role).toBe("[redacted]");
    expect(meta.inspectionId).toBe("ok");
  });
});
