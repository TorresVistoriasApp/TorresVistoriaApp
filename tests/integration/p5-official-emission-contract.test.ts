import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

function readRepo(relativePath: string): string {
  return readFileSync(path.resolve(process.cwd(), relativePath), "utf8");
}

describe("P.5 — contrato do fluxo de emissão oficial", () => {
  it("página usa gate síncrono e liberta o lock no finally", () => {
    const page = readRepo("src/modules/torres-vistoria/pages/inspection-report-page.tsx");
    expect(page).toContain("createExclusiveGate");
    expect(page).toContain("runExclusive");
    expect(page).toContain("emissionGateRef");
    expect(page).toContain("setGenerating(false)");
    expect(page).toContain("registerProfessionalLaudo");
    expect(page).not.toMatch(/retry|setInterval|while \(true\)/);
  });

  it("PREPARE + SEAL continuam exatamente duas chamadas create-report", () => {
    const pdf = readRepo("src/modules/torres-vistoria/services/pdf-service.ts");
    const block = pdf.slice(pdf.indexOf("registerProfessionalLaudo"));
    const invokes = block.match(/invokeCreateReport\(/g) ?? [];
    expect(invokes).toHaveLength(2);
    expect(block).not.toMatch(/functions\.invoke\("create-report"/);
    expect(block).toContain("generateLaudoPdf");
    expect(block).not.toContain("optimizePdfBlob");
  });

  it("create-report isenta SEAL persistente só com HMAC + inspection/tenant", () => {
    const edge = readRepo("supabase/functions/create-report/index.ts");
    expect(edge).toContain("consumePersistentRateLimit");
    expect(edge).toContain("sealTokenOk");
    expect(edge).toContain("preview.inspectionId === inspectionId && preview.tenantId === row.tenant_id");
    expect(edge).toContain("verifyReportIssueToken");
    expect(edge).not.toContain('action === "seal"');
  });

  it("SEAL reusa o verificationCode do token HMAC e não gera um segundo código", () => {
    const edge = readRepo("supabase/functions/create-report/index.ts");
    expect(edge).toContain("sealPayload?.verificationCode");
    expect(edge).not.toContain("tokenPayload.verificationCode !== code");
    expect(edge).toContain("buildVerificationCode");
  });
});
