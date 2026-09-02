import { describe, expect, it } from "vitest";
import { formatUserFacingError } from "@/core/errors/user-facing-errors";

describe("formatUserFacingError", () => {
  it("traduz e-mail já cadastrado sem confirmar existência da conta", () => {
    expect(
      formatUserFacingError("A user with this email address has already been registered"),
    ).toBe(
      "Se este e-mail puder ser cadastrado, enviaremos um link de confirmação. Verifique sua caixa de entrada.",
    );
  });

  it("preserva mensagens já em português", () => {
    expect(formatUserFacingError("Senha deve ter no mínimo 8 caracteres")).toBe(
      "Senha deve ter no mínimo 8 caracteres",
    );
  });

  it("traduz erro de token JWT expirado", () => {
    expect(formatUserFacingError('"exp" claim timestamp check failed')).toBe(
      "Sua sessão expirou ou não está autenticada. Efetue login novamente.",
    );
  });

  it("traduz limite de envio de e-mail do Supabase Auth", () => {
    expect(formatUserFacingError("email rate limit exceeded")).toBe(
      "Muitas tentativas realizadas. Aguarde um momento e tente novamente.",
    );
    expect(formatUserFacingError("over_email_send_rate_limit")).toBe(
      "Muitas tentativas realizadas. Aguarde um momento e tente novamente.",
    );
  });

  it("traduz falha de captcha/Turnstile", () => {
    expect(formatUserFacingError("captcha verification process failed")).toBe(
      "Conclua a verificação anti-bot antes de continuar.",
    );
  });
});
