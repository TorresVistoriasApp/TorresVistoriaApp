import { describe, expect, it } from "vitest";
import { sanitizeEmail, sanitizePlate, sanitizeText } from "@/lib/sanitize";

describe("sanitize", () => {
  it("remove tags HTML", () => {
    expect(sanitizeText("<script>alert(1)</script>Olá")).toBe("Olá");
  });

  it("normaliza e-mail", () => {
    expect(sanitizeEmail("  User@Example.COM  ")).toBe("user@example.com");
  });

  it("normaliza placa", () => {
    expect(sanitizePlate("abc-1d23")).toBe("ABC1D23");
  });
});
