import { describe, expect, it } from "vitest";
import { buildVerificationCode, formatLaudoNumber } from "@/lib/laudo/verification-code";

describe("verification-code", () => {
  it("formata número do laudo com ano e sequência", () => {
    expect(formatLaudoNumber(148, "2026-06-25")).toBe("TV-2026-000148");
    expect(formatLaudoNumber(1, "2026-01-01")).toBe("TV-2026-000001");
  });

  it("gera código de verificação legível na primeira versão", () => {
    expect(buildVerificationCode(148, "2026-06-25", 1)).toBe("TV-2026-000148");
  });

  it("inclui sufixo de versão em reemissões", () => {
    expect(buildVerificationCode(148, "2026-06-25", 2)).toBe("TV-2026-000148-V2");
    expect(buildVerificationCode(148, "2026-06-25", 3)).toBe("TV-2026-000148-V3");
  });
});
