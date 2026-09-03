import { describe, expect, it } from "vitest";
import {
  redactCnpj,
  redactCpf,
  redactChassis,
  redactDocument,
  redactEmail,
  redactKnownPiiValue,
  redactPhone,
} from "@/shared/lib/pii";

describe("PII — máscaras de interface (Nível 2)", () => {
  it("mascara CPF no formato ***.456.789-**", () => {
    expect(redactCpf("12345678909")).toBe("***.456.789-**");
    expect(redactDocument("123.456.789-09")).toBe("***.456.789-**");
  });

  it("mascara CNPJ no formato **.***.***/0001-**", () => {
    expect(redactCnpj("12345678000195")).toBe("**.***.***/0001-**");
    expect(redactDocument("12.345.678/0001-95")).toBe("**.***.***/0001-**");
  });

  it("mascara e-mail preservando domínio", () => {
    expect(redactEmail("brendow@email.com")).toBe("br*****@email.com");
    expect(redactEmail("a@empresa.com")).toBe("a*****@empresa.com");
  });

  it("mascara telefone celular como (61) 9****-1234", () => {
    expect(redactPhone("61987651234")).toBe("(61) 9****-1234");
    expect(redactPhone("(61) 98765-1234")).toBe("(61) 9****-1234");
  });

  it("não vaza dígitos demais em documento incompleto", () => {
    expect(redactDocument("12345")).toBe("***");
  });

  it("mascara o miolo do chassi em listagens", () => {
    expect(redactChassis("9BWZZZ377VT004251")).toBe("9BWZ•••••••••4251");
    expect(redactKnownPiiValue("chassis", "9BWZZZ377VT004251")).toBe("9BWZ•••••••••4251");
  });
});

describe("PII — auditoria (Nível 3)", () => {
  it("oculta segredos e mascara documento/e-mail", () => {
    expect(redactKnownPiiValue("password", "segredo")).toBeNull();
    expect(redactKnownPiiValue("document_hash", "abc")).toBeNull();
    expect(redactKnownPiiValue("client_document", "12345678909")).toBe("***.456.789-**");
    expect(redactKnownPiiValue("email", "ana@empresa.com")).toBe("an*****@empresa.com");
    expect(redactKnownPiiValue("client_document", "[redacted]")).toBe("[redacted]");
  });
});
