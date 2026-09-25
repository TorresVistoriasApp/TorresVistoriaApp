import { describe, expect, it } from "vitest";
import {
  signReportIssueToken,
  verifyReportIssueToken,
  type ReportIssueTokenPayload,
} from "../../helpers/laudo-seal-harness";

const basePayload = (): ReportIssueTokenPayload => ({
  inspectionId: "insp-1",
  tenantId: "tenant-1",
  verificationCode: "TV-TEST-CODE-0001",
  contentDigest: "a".repeat(64),
  nextVersion: 2,
  expMs: Date.now() + 60_000,
});

describe("P.4.1 — verifyReportIssueToken (espelho alinhado ao Edge)", () => {
  it("token válido → PERMITIDO", async () => {
    const token = await signReportIssueToken(basePayload());
    const payload = await verifyReportIssueToken(token);
    expect(payload.inspectionId).toBe("insp-1");
    expect(payload.nextVersion).toBe(2);
  });

  it("assinatura inválida → NEGADO", async () => {
    const token = await signReportIssueToken(basePayload());
    await expect(verifyReportIssueToken(`${token}x`)).rejects.toThrow(/inválido/i);
  });

  it("token adulterado (corpo base64) → NEGADO", async () => {
    const token = await signReportIssueToken(basePayload());
    const dot = token.lastIndexOf(".");
    const tampered = `${token.slice(0, dot - 2)}xx${token.slice(dot)}`;
    await expect(verifyReportIssueToken(tampered)).rejects.toThrow(/inválido/i);
  });

  it("token expirado → NEGADO", async () => {
    const token = await signReportIssueToken({ ...basePayload(), expMs: Date.now() - 1 });
    await expect(verifyReportIssueToken(token)).rejects.toThrow(/expirado/i);
  });

  it("JSON inválido no payload → NEGADO", async () => {
    const dotPayload = Buffer.from("{not-json", "utf8").toString("base64");
    await expect(verifyReportIssueToken(`${dotPayload}.deadbeef`)).rejects.toThrow();
  });

  it("formato sem ponto separador → NEGADO", async () => {
    await expect(verifyReportIssueToken("sem-assinatura")).rejects.toThrow(/inválido/i);
  });
});

describe("P.4.1 — campos do payload (validados no gate SEAL após verify)", () => {
  it("inspectionId / tenantId / code / digest / version distintos permanecem no payload parseado", async () => {
    const token = await signReportIssueToken(basePayload());
    const payload = await verifyReportIssueToken(token);
    expect(payload.inspectionId).not.toBe("outra-insp");
    expect(payload.tenantId).not.toBe("outro-tenant");
    expect(payload.verificationCode).toBe("TV-TEST-CODE-0001");
    expect(payload.contentDigest).toBe("a".repeat(64));
    expect(payload.nextVersion).toBe(2);
  });
});
