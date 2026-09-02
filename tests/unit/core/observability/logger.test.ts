import { describe, expect, it } from "vitest";
import { redactPii } from "@/core/observability/logger";

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
});
