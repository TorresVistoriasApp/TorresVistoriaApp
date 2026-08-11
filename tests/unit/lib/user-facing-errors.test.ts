import { describe, expect, it } from "vitest";
import { formatUserFacingError } from "@/core/errors/user-facing-errors";

describe("formatUserFacingError", () => {
  it("traduz e-mail já cadastrado para português formal", () => {
    expect(
      formatUserFacingError("A user with this email address has already been registered"),
    ).toBe("Já existe uma conta associada a este e-mail.");
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
});
