import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { parseCanonicalInspectionPhotoPath } from "@/modules/torres-vistoria/domain/photos/photo-assets";

function readRepo(relativePath: string): string {
  return readFileSync(path.resolve(process.cwd(), relativePath), "utf8");
}

const MIGRATION = "supabase/migrations/20260914120000_fase_o1_canonical_path_and_default_tenant_revoke.sql";

const TENANT = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const INSPECTION = "95968fbc-36d7-4e21-a4ad-dabc9390c390";
const FULL = `${TENANT}/${INSPECTION}/EXT_FRENTE/foto.webp`;
const THUMB = `${TENANT}/${INSPECTION}/EXT_FRENTE/thumbs/foto.webp`;

/** Espelha os predicados da migration O.1 (sem Postgres). */
function sqlCanonicalInspectionPhotoPath(pName: string): boolean {
  if (!pName || pName !== pName.trim()) return false;
  if (pName.includes("\\") || pName.includes("%") || pName.includes("..")) return false;
  if (pName.includes("//") || pName.includes("://") || pName.includes("?")) return false;
  if (pName.startsWith("/")) return false;
  const full =
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\/[A-Za-z0-9][A-Za-z0-9_]{0,80}\/[A-Za-z0-9._-]{1,180}\.webp$/;
  const thumb =
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\/[A-Za-z0-9][A-Za-z0-9_]{0,80}\/thumbs\/[A-Za-z0-9._-]{1,180}\.webp$/;
  return full.test(pName) || thumb.test(pName);
}

describe("Fase O.1 — path canônico SQL alinhado ao parser JS", () => {
  const sql = readRepo(MIGRATION);

  it("migration endurece predicados e revoga get_default_tenant_id de authenticated", () => {
    expect(sql).toContain("CREATE OR REPLACE FUNCTION public.is_canonical_inspection_photo_object_path");
    expect(sql).toContain("position('%' IN p_name) = 0");
    expect(sql).toContain("position('..' IN p_name) = 0");
    expect(sql).toContain("position('//' IN p_name) = 0");
    expect(sql).toContain("REVOKE ALL ON FUNCTION public.get_default_tenant_id() FROM PUBLIC, anon, authenticated");
    expect(sql).not.toContain("GRANT EXECUTE ON FUNCTION public.get_default_tenant_id()");
  });

  it("vetores de ataque coincidem entre JS e predicado SQL", () => {
    const accepted = [FULL, THUMB];
    const rejected = [
      `/${FULL}`,
      `${TENANT}\\${INSPECTION}\\EXT_FRENTE\\foto.webp`,
      `${TENANT}/${INSPECTION}/EXT_FRENTE/../foto.webp`,
      `${TENANT}/%2e%2e/${INSPECTION}/EXT_FRENTE/foto.webp`,
      `${TENANT}//${INSPECTION}/EXT_FRENTE/foto.webp`,
      `${FULL}?signed=1`,
      `${TENANT}/${INSPECTION}/EXT_FRENTE/foto.jpg`,
      `legado/${INSPECTION}/EXT_FRENTE/foto.webp`,
      `${TENANT}/${INSPECTION}//foto.webp`,
      "https://evil.example/foto.webp",
    ];

    for (const pathValue of accepted) {
      expect(parseCanonicalInspectionPhotoPath(pathValue)).not.toBeNull();
      expect(sqlCanonicalInspectionPhotoPath(pathValue)).toBe(true);
    }
    for (const pathValue of rejected) {
      expect(parseCanonicalInspectionPhotoPath(pathValue)).toBeNull();
      expect(sqlCanonicalInspectionPhotoPath(pathValue)).toBe(false);
    }
  });
});

describe("Fase O.1 — service_role e demo mode", () => {
  it("frontend e env versionável não carregam SERVICE_ROLE", () => {
    expect(readRepo("src/infra/supabase/client.ts")).not.toContain("SERVICE_ROLE");
    expect(readRepo("src/config/env.ts")).not.toContain("SERVICE_ROLE");
    expect(readRepo("src/vite-env.d.ts")).not.toContain("SERVICE_ROLE");
    const example = readRepo(".env.example");
    expect(example).not.toMatch(/^VITE_.*SERVICE_ROLE/m);
    expect(example).toContain("VITE_DEMO_MODE=false");
  });

  it("isDemoModeEnabled não é usado em rotas ou guards", () => {
    expect(readRepo("src/config/env.ts")).toContain("if (prod) return false");
    const appFiles = [
      "src/app/bootstrap.tsx",
      "src/core/auth/routes.tsx",
      "src/core/rbac/components/permission-guard.tsx",
      "src/core/tenant/tenant-guard.tsx",
    ];
    for (const file of appFiles) {
      expect(readRepo(file)).not.toContain("isDemoModeEnabled");
    }
  });
});

describe("Fase O.1 — PDF oficial não vaza path interno", () => {
  it("não interpola storage_path, UUID de tenant ou signed URL nas fotos", () => {
    const pdf = readRepo("supabase/functions/_shared/official-laudo-pdf.ts");
    expect(pdf).not.toContain("photo.storage_path");
    expect(pdf).not.toContain("signedUrl");
    expect(pdf).toContain('writer.kv("Categoria", photo.category)');
    expect(pdf).toContain('writer.kv("Quantidade", String(input.photos.length))');
  });
});
