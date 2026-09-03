import { describe, expect, it } from "vitest";
import { generateTotp } from "../../e2e/totp";

describe("generateTotp", () => {
  it("segue o vetor RFC 6238 SHA1 (6 dígitos)", () => {
    // Secret ASCII "12345678901234567890" em Base32.
    const secret = "GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ";
    expect(generateTotp(secret, 59_000)).toBe("287082");
  });

  it("é estável no mesmo step e muda no seguinte", () => {
    const secret = "JBSWY3DPEHPK3PXP";
    const a = generateTotp(secret, 1_700_000_010_000);
    const b = generateTotp(secret, 1_700_000_025_000);
    const c = generateTotp(secret, 1_700_000_040_000);
    expect(a).toMatch(/^\d{6}$/);
    expect(a).toBe(b);
    expect(c).not.toBe(a);
  });
});
