import { describe, expect, it } from "vitest";
import { isValidCpf, normalizeCpf } from "@/core/auth/validators/cpf";
import { isValidCnpj, normalizeCnpj } from "@/core/auth/validators/cnpj";

describe("cpf validator", () => {
  it("normaliza dígitos", () => {
    expect(normalizeCpf("123.456.789-09")).toBe("12345678909");
  });

  it("valida CPF correto", () => {
    expect(isValidCpf("123.456.789-09")).toBe(true);
  });

  it("rejeita sequência inválida", () => {
    expect(isValidCpf("111.111.111-11")).toBe(false);
  });
});

describe("cnpj validator", () => {
  it("normaliza dígitos", () => {
    expect(normalizeCnpj("11.444.777/0001-61")).toBe("11444777000161");
  });

  it("valida CNPJ correto", () => {
    expect(isValidCnpj("11.444.777/0001-61")).toBe(true);
  });

  it("rejeita sequência inválida", () => {
    expect(isValidCnpj("11.111.111/1111-11")).toBe(false);
  });
});
