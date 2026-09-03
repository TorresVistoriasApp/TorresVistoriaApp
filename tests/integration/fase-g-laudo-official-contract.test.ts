import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

function readRepo(relativePath: string): string {
  return readFileSync(path.resolve(process.cwd(), relativePath), "utf8");
}

function allMigrations(): string {
  const dir = path.resolve(process.cwd(), "supabase/migrations");
  return readdirSync(dir)
    .filter((name) => name.endsWith(".sql"))
    .sort()
    .map((name) => readFileSync(path.join(dir, name), "utf8"))
    .join("\n");
}

describe("Fase G — laudo oficial só no servidor", () => {
  it("create-report ignora payload do cliente além do inspectionId", () => {
    const edge = readRepo("supabase/functions/create-report/index.ts");
    expect(edge).toContain("inspectionId é obrigatório");
    expect(edge).not.toContain("providedVerificationCode");
    expect(edge).not.toContain("providedIntegrityHash");
    expect(edge).not.toContain("body.verificationCode");
    expect(edge).not.toContain("body.integrityHash");
    expect(edge).not.toContain("body.storagePath");
    expect(edge).not.toContain('action === "seal"');
    expect(edge).toContain("buildOfficialLaudoPdf");
    expect(edge).toContain("buildVerificationCode");
    expect(edge).toContain("buildStoragePath");
    expect(edge).toContain("sha256Hex(pdfBytes)");
    expect(edge).toContain('from("reports").upload');
    expect(edge).toContain("canAccessInspection");
    expect(edge).toContain("consumePersistentRateLimit");
  });

  it("PDF oficial é montado com dados do banco, não do body", () => {
    const edge = readRepo("supabase/functions/create-report/index.ts");
    expect(edge).toContain('from("inspections")');
    expect(edge).toContain('from("inspection_checklists")');
    expect(edge).toContain('from("inspection_photos")');
    expect(edge).toContain('from("companies")');
    expect(edge).toContain('from("profiles")');
    expect(edge).toContain("row.tenant_id");
    expect(edge).toContain("row.created_by");
  });

  it("cliente não envia PDF, hash, código nem path", () => {
    const pdf = readRepo("src/modules/torres-vistoria/services/pdf-service.ts");
    const official = pdf.slice(pdf.indexOf("registerProfessionalLaudo"));
    expect(official).toContain("body: { inspectionId: params.inspection.id }");
    expect(official).not.toContain(".upload(");
    expect(official).not.toContain("integrityHash: params");
    expect(official).not.toContain("verificationCode: params");
    expect(official).not.toContain("storagePath: params");
    expect(official).toContain("downloadPdf(storagePath)");
  });

  it("prévia do navegador não se apresenta como oficial", () => {
    const pdf = readRepo("src/modules/torres-vistoria/services/pdf-service.ts");
    expect(pdf).toContain("PREVIA-NAO-OFICIAL");
    expect(pdf).toContain("options.preview");
    expect(readRepo("src/modules/torres-vistoria/components/pdf/pdf-download-button.tsx")).toContain(
      "preview: true",
    );
    expect(readRepo("src/modules/torres-vistoria/components/pdf/laudo-template.tsx")).toContain(
      "Prévia — não é o laudo oficial",
    );
  });

  it("generate-pdf não emite código oficial", () => {
    const edge = readRepo("supabase/functions/generate-pdf/index.ts");
    expect(edge).toContain("official: false");
    expect(edge).not.toContain("verificationCode");
    expect(edge).not.toContain("Math.random");
    expect(edge).toContain("canAccessInspection");
  });
});

describe("Fase G — Storage e adulteração", () => {
  it("authenticated não grava mais no bucket reports", () => {
    const sql = readRepo("supabase/migrations/20260903120000_fase_g_server_official_laudo.sql");
    expect(sql).toContain("DROP POLICY IF EXISTS storage_reports_insert");
    expect(sql).toContain("DROP POLICY IF EXISTS storage_reports_update");
    expect(sql).toContain("DROP POLICY IF EXISTS reports_insert");
    expect(sql).toContain("DROP POLICY IF EXISTS reports_update");
    expect(sql).toContain("DROP POLICY IF EXISTS reports_delete");
    expect(allMigrations()).toContain("storage_reports_select");
  });

  it("vistoria concluída não aceita alteração de conteúdo", () => {
    const sql = readRepo("supabase/migrations/20260903120000_fase_g_server_official_laudo.sql");
    expect(sql).toContain("prevent_completed_inspection_tamper");
    expect(sql).toContain("Vistoria concluída não pode ser alterada.");
    expect(sql).toContain("trg_prevent_completed_checklist_tamper");
    expect(sql).toContain("trg_prevent_completed_photos_tamper");
  });

  it("path canônico continua tenant/inspection/arquivo.pdf", () => {
    const edge = readRepo("supabase/functions/create-report/index.ts");
    expect(edge).toContain("`${tenantId}/${inspectionId}/laudo-v${version}-${suffix}.pdf`");
    expect(allMigrations()).toContain("is_canonical_report_object_path");
  });
});
