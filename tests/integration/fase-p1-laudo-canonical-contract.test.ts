import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

function readRepo(relativePath: string): string {
  return readFileSync(path.resolve(process.cwd(), relativePath), "utf8");
}

describe("Fase P.1 — laudo canônico único", () => {
  it("prévia e oficial usam generateLaudoPdf / buildLaudoDocDefinition", () => {
    const download = readRepo("src/modules/torres-vistoria/services/laudo-pdf-download.ts");
    const pdf = readRepo("src/modules/torres-vistoria/services/pdf-service.ts");
    expect(download).toContain("generateLaudoPdf");
    expect(download).toContain("buildLaudoDocDefinition");
    expect(pdf).toContain("generateLaudoPdf");
    expect(readRepo("supabase/functions/create-report/index.ts")).not.toContain("buildOfficialLaudoPdf");
    expect(readRepo("supabase/functions/create-report/index.ts")).not.toContain("official-laudo-pdf");
  });

  it("não existe segundo gerador pdf-lib ativo", () => {
    const fs = readFileSync;
    let exists = true;
    try {
      fs(path.resolve(process.cwd(), "supabase/functions/_shared/official-laudo-pdf.ts"), "utf8");
    } catch {
      exists = false;
    }
    expect(exists).toBe(false);
  });

  it("seal exige token, digest e marcadores no PDF", () => {
    const edge = readRepo("supabase/functions/create-report/index.ts");
    const digest = readRepo("supabase/functions/_shared/laudo-content-digest.ts");
    expect(edge).toContain("verifyReportIssueToken");
    expect(edge).toContain("pdfContainsBindingMarkers");
    expect(digest).toContain("buildLaudoContentDigest");
    expect(readRepo("supabase/functions/_shared/pdf-binding-markers.ts")).toContain("TORRES_BINDING_V1");
    expect(readRepo("src/shared/lib/pdf-binding-markers.ts")).toContain("applyTorresOfficialPdfBinding");
  });

  it("documentação descreve pdfmake e não pdf-lib", () => {
    const doc = readRepo("docs/laudo-oficial.md");
    expect(doc).toContain("buildLaudoDocDefinition");
    expect(doc).not.toContain("pdf-lib");
  });
});
