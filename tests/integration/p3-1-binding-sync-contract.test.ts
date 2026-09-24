import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

function readRepo(relativePath: string): string {
  return readFileSync(path.resolve(process.cwd(), relativePath), "utf8");
}

function extractBindingHeader(source: string): string {
  const start = source.indexOf("export const TORRES_PDF_BINDING_PREFIX");
  const fnStart = source.indexOf("function latin1(bytes: Uint8Array)");
  if (start < 0 || fnStart < 0) return "";
  return source
    .slice(start, fnStart)
    .replace(/export function applyTorresOfficialPdfBinding[\s\S]*?\n}\r?\n\r?\n/, "")
    .trim();
}

function extractValidationTail(source: string): string {
  const start = source.indexOf("function latin1(bytes: Uint8Array)");
  const marker = "return corpus.includes(expectedLine);";
  const end = source.indexOf(marker);
  if (start < 0 || end < 0) return "";
  return source.slice(start, end + marker.length);
}

describe("P.3.1 — sincronia browser × Edge (pdf-binding-markers)", () => {
  const browser = readRepo("src/shared/lib/pdf-binding-markers.ts");
  const edge = readRepo("supabase/functions/_shared/pdf-binding-markers.ts");

  it("prefixo, buildTorresPdfBindingKeywords e validação idênticos (browser só adiciona apply*)", () => {
    expect(extractBindingHeader(browser)).toBe(extractBindingHeader(edge));
    expect(extractValidationTail(browser)).toBe(extractValidationTail(edge));
    expect(extractValidationTail(browser).length).toBeGreaterThan(100);
  });

  it("browser expõe applyTorresOfficialPdfBinding; Edge não precisa gerar PDF", () => {
    expect(browser).toContain("applyTorresOfficialPdfBinding");
    expect(edge).not.toContain("applyTorresOfficialPdfBinding");
  });

  it("create-report usa verifyReportIssueToken antes de pdfContainsBindingMarkers", () => {
    const report = readRepo("supabase/functions/create-report/index.ts");
    const tokenIdx = report.indexOf("verifyReportIssueToken");
    const bindingIdx = report.lastIndexOf("pdfContainsBindingMarkers");
    expect(tokenIdx).toBeGreaterThan(0);
    expect(bindingIdx).toBeGreaterThan(tokenIdx);
    expect(report.indexOf("requireCaller")).toBeLessThan(tokenIdx);
    expect(report.indexOf("canAccessInspection")).toBeLessThan(tokenIdx);
  });

  it("binding oficial só com contentDigest (sem atalho sem marcadores)", () => {
    const pdf = readRepo("src/modules/torres-vistoria/services/pdf-service.ts");
    expect(pdf).toContain("applyTorresOfficialPdfBinding");
    expect(pdf).toContain("} else if (options.contentDigest) {");
    expect(pdf).toContain("options.preview");
    const download = readRepo("src/modules/torres-vistoria/services/laudo-pdf-download.ts");
    expect(download).toContain('mode: params.preview ? "preview" : "official"');
    expect(download).toContain("contentDigest: preview ? undefined : params.contentDigest");
  });

  it("fluxo oficial não chama optimizePdfBlob no registerProfessionalLaudo", () => {
    const pdf = readRepo("src/modules/torres-vistoria/services/pdf-service.ts");
    const start = pdf.indexOf("registerProfessionalLaudo");
    const end = pdf.indexOf("return { verificationCode", start);
    const block = pdf.slice(start, end > start ? end : start + 2500);
    expect(block).toContain("generateLaudoPdf");
    expect(block).not.toContain("optimizePdfBlob");
    expect(block).not.toContain("optimize: true");
  });
});
