import { describe, expect, it } from "vitest";
import { buildVerificationCode, formatLaudoNumber, summarizeVerificationCode } from "@/modules/torres-vistoria/domain/laudo/verification-code";

describe("verification-code", () => {
  it("formata número do laudo com ano e sequência", () => {
    expect(formatLaudoNumber(148, "2026-06-25")).toBe("TV-2026-000148");
    expect(formatLaudoNumber(1, "2026-01-01")).toBe("TV-2026-000001");
  });

  it("gera código de verificação opaco e independente do número da vistoria", () => {
    const code = buildVerificationCode();
    expect(code).toMatch(/^TV-[A-Z2-9]{4}-[A-Z2-9]{4}-[A-Z2-9]{4}$/);
    expect(code).not.toBe("TV-2026-000148");
  });

  it("gera códigos distintos em chamadas consecutivas", () => {
    const codes = new Set(Array.from({ length: 20 }, () => buildVerificationCode()));
    expect(codes.size).toBe(20);
  });

  it("resume o código de autenticidade sem alterar o valor original", () => {
    expect(summarizeVerificationCode("TV-K7M2-9XQH-4NWP")).toBe("TV-••••-4NWP");
    expect(summarizeVerificationCode("TV-ABCD")).toBe("TV-ABCD");
  });
});
