import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const MIGRATION = "20260806170000_rename_company_id_to_tenant_id.sql";

function readMigration(fileName: string): string {
  return readFileSync(path.resolve(process.cwd(), "supabase/migrations", fileName), "utf8");
}

describe("photo upload security contract (Fase 4.5)", () => {
  const sql = readMigration(MIGRATION);

  it("validate_inspection_photo_storage_path exige tenant_id no prefixo do storage_path", () => {
    expect(sql).toContain("CREATE OR REPLACE FUNCTION public.validate_inspection_photo_storage_path");
    expect(sql).toContain("split_part(NEW.storage_path, '/', 1) <> NEW.tenant_id::text");
    expect(sql).toContain("storage_path deve iniciar com tenant_id da linha");
  });

  it("validate_inspection_photo_storage_path exige inspection_id no storage_path", () => {
    expect(sql).toContain("split_part(NEW.storage_path, '/', 2) <> NEW.inspection_id::text");
    expect(sql).toContain("storage_path deve conter inspection_id da linha");
  });

  it("validate_inspection_photo_storage_path restringe extensão a .webp", () => {
    expect(sql).toContain("NEW.storage_path !~ '\\.webp$'");
    expect(sql).toContain("fotos de vistoria devem usar extensão .webp");
  });

  it("thumbs_url mantém padrão do path canônico", () => {
    expect(sql).toContain("thumbnail_url deve seguir o padrão .../thumbs/arquivo.webp");
  });
});

