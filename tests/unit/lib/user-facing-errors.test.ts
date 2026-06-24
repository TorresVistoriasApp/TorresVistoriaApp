import { describe, expect, it } from "vitest";
import { formatUserFacingError } from "@/lib/user-facing-errors";

describe("formatUserFacingError", () => {
  it("traduz e-mail já cadastrado para português formal", () => {
    expect(
      formatUserFacingError("A user with this email address has already been registered"),
    ).toBe("Já existe um usuário cadastrado com este endereço de e-mail.");
  });

  it("preserva mensagens já em português", () => {
    expect(formatUserFacingError("Senha deve ter no mínimo 8 caracteres")).toBe(
      "Senha deve ter no mínimo 8 caracteres",
    );
  });
});
