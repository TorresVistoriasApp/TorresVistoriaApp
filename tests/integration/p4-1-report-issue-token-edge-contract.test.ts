import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

function readRepo(relativePath: string): string {
  return readFileSync(path.resolve(process.cwd(), relativePath), "utf8");
}

function extractVerifyReportIssueToken(source: string): string {
  const marker = "export async function verifyReportIssueToken";
  const start = source.indexOf(marker);
  if (start < 0) return "";
  const nextExport = source.indexOf("\nexport ", start + marker.length);
  return nextExport > start ? source.slice(start, nextExport) : source.slice(start);
}

describe("P.4.1 — contrato Edge report-issue-token (sem import Deno)", () => {
  const edge = readRepo("supabase/functions/_shared/report-issue-token.ts");
  const harness = readRepo("tests/helpers/laudo-seal-harness.ts");
  const edgeVerify = extractVerifyReportIssueToken(edge);
  const harnessVerify = extractVerifyReportIssueToken(harness);

  it("Edge decodifica payload com jsonBody (não referencia body inexistente)", () => {
    expect(edgeVerify).toContain("const jsonBody = atob(encoded);");
    expect(edgeVerify).toContain("JSON.parse(jsonBody)");
    expect(edgeVerify).not.toMatch(/JSON\.parse\(atob\(body\)\)/);
    expect(edgeVerify).not.toMatch(/JSON\.parse\(body\)/);
  });

  it("harness espelha a mesma decodificação do payload", () => {
    expect(harnessVerify).toContain("JSON.parse(jsonBody)");
    expect(harnessVerify).not.toMatch(/JSON\.parse\(atob\(body\)\)/);
  });

  it("Edge mantém HMAC e TTL após decodificação", () => {
    expect(edgeVerify).toContain("await hmacSign(jsonBody)");
    expect(edgeVerify).toContain('throw new Error("Token de emissão inválido.")');
    expect(edgeVerify).toContain("Date.now() > payload.expMs");
    expect(edgeVerify).toContain('throw new Error("Token de emissão expirado. Gere o laudo novamente.")');
  });
});
