import { describe, expect, it } from "vitest";
import { loginSchema, resetPasswordSchema } from "@/schemas/auth";

/** Senha forte só para validar o schema — não é credencial de ambiente. */
const SAMPLE_STRONG_PASSWORD = "Str0ngTestPass!";

describe("loginSchema", () => {
  it("aceita credenciais válidas", () => {
    const result = loginSchema.safeParse({
      email: "usuario@exemplo.com",
      password: SAMPLE_STRONG_PASSWORD,
      acceptTerms: true,
    });
    expect(result.success).toBe(true);
  });

  it("rejeita senha fraca no login", () => {
    const result = loginSchema.safeParse({
      email: "usuario@exemplo.com",
      password: "123456",
      acceptTerms: true,
    });
    expect(result.success).toBe(false);
  });

  it("rejeita e-mail inválido", () => {
    const result = loginSchema.safeParse({
      email: "invalido",
      password: SAMPLE_STRONG_PASSWORD,
      acceptTerms: true,
    });
    expect(result.success).toBe(false);
  });

  it("exige aceite dos termos LGPD", () => {
    const result = loginSchema.safeParse({
      email: "usuario@exemplo.com",
      password: SAMPLE_STRONG_PASSWORD,
      acceptTerms: false,
    });
    expect(result.success).toBe(false);
  });
});

describe("resetPasswordSchema", () => {
  it("exige senhas iguais e fortes", () => {
    const ok = resetPasswordSchema.safeParse({
      password: "NovaSenha1!",
      confirmPassword: "NovaSenha1!",
    });
    const fail = resetPasswordSchema.safeParse({
      password: "NovaSenha1!",
      confirmPassword: "outra",
    });
    const weak = resetPasswordSchema.safeParse({
      password: "nova123",
      confirmPassword: "nova123",
    });
    expect(ok.success).toBe(true);
    expect(fail.success).toBe(false);
    expect(weak.success).toBe(false);
  });
});
