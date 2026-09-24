import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

function readRepo(relativePath: string): string {
  return readFileSync(path.resolve(process.cwd(), relativePath), "utf8");
}

describe("Fase N — ciclo de vida das fotos (contrato)", () => {
  it("sempre recodifica para WebP e aplica teto de 2 MB", () => {
    const compress = readRepo("src/shared/lib/compress-image.ts");
    expect(compress).toContain('fileType: "image/webp"');
    expect(compress).toContain("preserveExif: false");
    expect(compress).toContain("reduceWebpToLimit");
    expect(compress).not.toContain('source.type === "image/webp" && source.size <= MAX_OUTPUT_BYTES');
    expect(compress).toContain("A foto continua acima de 2 MB");
  });

  it("upload sequencial com rollback dos paths da operação", () => {
    const service = readRepo("src/modules/torres-vistoria/services/photo-service.ts");
    expect(service).toContain("commitPhotoObjectsWithRollback");
    expect(service).toContain("upsert: false");
    expect(service).not.toContain("SERVICE_ROLE");
    expect(service).toContain("purgeInspectionPhotoObjects");
    expect(service).toContain("assertPurgePhotoSetIsOwned");
    expect(service).toContain("resolvePhotoRemovalTargets");
  });

  it("exclusão de vistoria e rascunho passa pelo purge full+thumb", () => {
    expect(readRepo("src/modules/torres-vistoria/services/inspection-service.ts")).toContain(
      "purgeInspectionPhotoObjects",
    );
    const draft = readRepo("src/modules/torres-vistoria/draft/services/draft-service.ts");
    expect(draft).toContain("purgeInspectionPhotoObjects");
    expect(draft).not.toContain("STORAGE_BUCKET");
  });

  it("signed URL permanece a única leitura e buckets privados não são revertidos", () => {
    const signed = readRepo("src/infra/storage/signed-url.ts");
    expect(signed).toContain("createSignedUrl");
    expect(signed).toContain("DEFAULT_TTL_SECONDS = 60 * 60");
    const buckets = readRepo("supabase/migrations/20260724140000_private_pii_storage_buckets.sql");
    expect(buckets).toContain("SET public = false");
    expect(readRepo("src/config/env.ts")).not.toContain("SERVICE_ROLE");
  });

  it("laudo PDF canônico não imprime storage_path da foto", () => {
    const pdf = readRepo("src/modules/torres-vistoria/domain/laudo/laudo-doc-definition.ts");
    const layout = readRepo("src/modules/torres-vistoria/domain/photos/pdf-photo-layout.ts");
    expect(pdf).not.toContain("storage_path");
    expect(layout).not.toContain("storage_path");
  });

  it("remove amarra ID ao storage_path da linha e o matcher de 404 não cobre autorização", () => {
    const assets = readRepo("src/modules/torres-vistoria/domain/photos/photo-assets.ts");
    expect(assets).toContain("resolvePhotoRemovalTargets");
    expect(assets).toContain("AUTH_OR_POLICY_RE");
    expect(assets).toContain("parseCanonicalInspectionPhotoPath");
    expect(assets).not.toContain('normalized.includes("not found")');
    const service = readRepo("src/modules/torres-vistoria/services/photo-service.ts");
    expect(service).toContain("queries.photos.byId");
    expect(service).toContain("resolvePhotoRemovalTargets");
    expect(service).toContain("assertPurgePhotoSetIsOwned");
  });

  it("fila offline só remove o item após upload e evita flush paralelo do mesmo id", () => {
    const queue = readRepo("src/modules/torres-vistoria/draft/lib/sync-queue.ts");
    expect(queue).toContain("flushOfflineQueueInflight");
    expect(queue).toContain("tryClaimPhotoUpload");
    expect(queue).toContain("releasePhotoUploadClaim");
    expect(queue.indexOf("photoService.upload")).toBeLessThan(queue.indexOf("removePhotoUpload"));
  });
});
