import { describe, expect, it } from "vitest";
import { loginSchema, resetPasswordSchema } from "@/schemas/auth";

describe("loginSchema", () => {
  it("aceita credenciais válidas", () => {
    const result = loginSchema.safeParse({
      email: "admin@torresvistorias.com.br",
      password: "TorresDemo2026!",
      acceptTerms: true,
    });
    expect(result.success).toBe(true);
  });

  it("rejeita e-mail inválido", () => {
    const result = loginSchema.safeParse({
      email: "invalido",
      password: "123456",
      acceptTerms: true,
    });
    expect(result.success).toBe(false);
  });

  it("exige aceite dos termos LGPD", () => {
    const result = loginSchema.safeParse({
      email: "admin@torresvistorias.com.br",
      password: "TorresDemo2026!",
      acceptTerms: false,
    });
    expect(result.success).toBe(false);
  });
});

describe("resetPasswordSchema", () => {
  it("exige senhas iguais", () => {
    const ok = resetPasswordSchema.safeParse({
      password: "nova123",
      confirmPassword: "nova123",
    });
    const fail = resetPasswordSchema.safeParse({
      password: "nova123",
      confirmPassword: "outra",
    });
    expect(ok.success).toBe(true);
    expect(fail.success).toBe(false);
  });
});
