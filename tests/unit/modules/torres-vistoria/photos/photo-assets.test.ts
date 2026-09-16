import { describe, expect, it, vi } from "vitest";
import {
  buildInspectionPhotoPath,
  buildInspectionPhotoThumbnailPath,
  inspectionPhotoAssetPaths,
} from "@/infra/storage/paths";
import {
  assertPurgePhotoSetIsOwned,
  collectInspectionPhotoAssetPaths,
  commitPhotoObjectsWithRollback,
  filterInspectionOwnedPhotoPaths,
  findOrphanInspectionPhotoObjectNames,
  findSoftDeletedPhotoAssetPaths,
  isBenignStorageRemoveError,
  isPhotoSyncClaimHeld,
  parseCanonicalInspectionPhotoPath,
  photoPathBelongsToInspection,
  PhotoPathMismatchError,
  resolvePhotoRemovalTargets,
} from "@/modules/torres-vistoria/domain/photos/photo-assets";
import { isWithinPhotoUploadLimit } from "@/modules/torres-vistoria/domain/photos/photo-size";

const TENANT = "00000000-0000-4000-8000-000000000001";
const OTHER = "00000000-0000-4000-8000-000000000099";
const INSPECTION = "11111111-1111-4111-8111-111111111111";

function row(overrides: Partial<{
  id: string;
  tenant_id: string;
  inspection_id: string;
  storage_path: string;
  deleted_at: string | null;
}> = {}) {
  const storage_path = buildInspectionPhotoPath(TENANT, INSPECTION, "FRENTE", "a.webp");
  return {
    id: "photo-1",
    tenant_id: TENANT,
    inspection_id: INSPECTION,
    storage_path,
    deleted_at: null as string | null,
    ...overrides,
  };
}

describe("inspection photo asset paths", () => {
  it("deriva full + thumb sem aninhar thumbs/", () => {
    const full = buildInspectionPhotoPath(TENANT, INSPECTION, "FRENTE", "a.webp");
    const thumb = buildInspectionPhotoThumbnailPath(full);
    expect(inspectionPhotoAssetPaths(full)).toEqual([full, thumb]);
    expect(buildInspectionPhotoThumbnailPath(thumb)).toBe(thumb);
  });

  it("não amplia path para outro tenant", () => {
    const path = `${TENANT}/${INSPECTION}/FRENTE/a.webp`;
    expect(photoPathBelongsToInspection(path, TENANT, INSPECTION)).toBe(true);
    expect(photoPathBelongsToInspection(path, OTHER, INSPECTION)).toBe(false);
    expect(photoPathBelongsToInspection(`../${path}`, TENANT, INSPECTION)).toBe(false);
  });

  it("filtra apenas objetos da vistoria", () => {
    const owned = `${TENANT}/${INSPECTION}/FRENTE/a.webp`;
    const foreign = `${OTHER}/${INSPECTION}/FRENTE/b.webp`;
    const filtered = filterInspectionOwnedPhotoPaths([owned, foreign], TENANT, INSPECTION);
    expect(filtered).toContain(owned);
    expect(filtered).toContain(buildInspectionPhotoThumbnailPath(owned));
    expect(filtered.some((p) => p.startsWith(`${OTHER}/`))).toBe(false);
  });
});

describe("canonical photo path", () => {
  const valid = `${TENANT}/${INSPECTION}/FRENTE/a.webp`;
  const thumb = `${TENANT}/${INSPECTION}/FRENTE/thumbs/a.webp`;

  it("aceita full e thumb canônicos", () => {
    expect(parseCanonicalInspectionPhotoPath(valid)).toMatchObject({ isThumbnail: false, fileName: "a.webp" });
    expect(parseCanonicalInspectionPhotoPath(thumb)).toMatchObject({ isThumbnail: true, fileName: "a.webp" });
  });

  it("rejeita traversal, encoding, absoluto e extensão inválida", () => {
    expect(photoPathBelongsToInspection(`${TENANT}/${INSPECTION}/FRENTE/../x.webp`, TENANT, INSPECTION)).toBe(false);
    expect(photoPathBelongsToInspection(`${TENANT}/${INSPECTION}/%2e%2e/FRENTE/a.webp`, TENANT, INSPECTION)).toBe(false);
    expect(photoPathBelongsToInspection(`${TENANT}/%2F${INSPECTION}/FRENTE/a.webp`, TENANT, INSPECTION)).toBe(false);
    expect(photoPathBelongsToInspection(`${TENANT}\\${INSPECTION}\\FRENTE\\a.webp`, TENANT, INSPECTION)).toBe(false);
    expect(photoPathBelongsToInspection(`/${valid}`, TENANT, INSPECTION)).toBe(false);
    expect(photoPathBelongsToInspection(`${TENANT}/${INSPECTION}/FRENTE/a.jpg`, TENANT, INSPECTION)).toBe(false);
    expect(photoPathBelongsToInspection(`${TENANT}/${INSPECTION}/FRENTE/extra/a.webp`, TENANT, INSPECTION)).toBe(false);
    expect(photoPathBelongsToInspection("not-a-uuid/also-bad/FRENTE/a.webp", TENANT, INSPECTION)).toBe(false);
    expect(photoPathBelongsToInspection(`${TENANT}/${INSPECTION}/FRENTE/a.webp`, "bad", INSPECTION)).toBe(false);
  });
});

describe("isBenignStorageRemoveError", () => {
  it("aceita ausência real com statusCode 404 do SDK", () => {
    expect(isBenignStorageRemoveError({ statusCode: "404", message: "Object not found" })).toBe(true);
    expect(isBenignStorageRemoveError({ statusCode: 404, error: "not_found" })).toBe(true);
    expect(isBenignStorageRemoveError({ error: "NoSuchKey", message: "The specified key does not exist." })).toBe(true);
  });

  it("nunca trata autorização/RLS como ausência", () => {
    expect(isBenignStorageRemoveError({ statusCode: 403, message: "Forbidden" })).toBe(false);
    expect(isBenignStorageRemoveError({ statusCode: 401, message: "Unauthorized" })).toBe(false);
    expect(isBenignStorageRemoveError({ statusCode: 404, message: "Unauthorized" })).toBe(false);
    expect(isBenignStorageRemoveError("permission denied")).toBe(false);
    expect(isBenignStorageRemoveError("new row violates row-level security")).toBe(false);
    expect(isBenignStorageRemoveError("Access denied by RLS policy")).toBe(false);
    expect(isBenignStorageRemoveError("Storage 404")).toBe(false);
    expect(isBenignStorageRemoveError("unknown failure")).toBe(false);
  });
});

describe("resolvePhotoRemovalTargets", () => {
  it("usa o path da linha e deriva o thumb", () => {
    const current = row();
    const targets = resolvePhotoRemovalTargets(current, current.storage_path);
    expect(targets.skip).toBe(false);
    expect(targets.paths).toEqual(inspectionPhotoAssetPaths(current.storage_path));
  });

  it("rejeita path adulterado ou de outra foto", () => {
    const current = row();
    const other = buildInspectionPhotoPath(TENANT, INSPECTION, "FRENTE", "other.webp");
    expect(() => resolvePhotoRemovalTargets(current, other)).toThrow(PhotoPathMismatchError);
    expect(() => resolvePhotoRemovalTargets(null)).toThrow("Foto não encontrada");
  });

  it("não apaga path de outro tenant", () => {
    const current = row({
      storage_path: buildInspectionPhotoPath(OTHER, INSPECTION, "FRENTE", "a.webp"),
    });
    expect(() => resolvePhotoRemovalTargets(current)).toThrow(/inválido/);
  });

  it("idempotente quando já tem deleted_at", () => {
    const targets = resolvePhotoRemovalTargets(row({ deleted_at: "2026-01-01T00:00:00Z" }));
    expect(targets.skip).toBe(true);
    expect(targets.paths).toEqual([]);
  });
});

describe("assertPurgePhotoSetIsOwned", () => {
  it("falha fechado se algum path não for da vistoria", () => {
    expect(() =>
      assertPurgePhotoSetIsOwned(
        [
          {
            tenant_id: TENANT,
            inspection_id: INSPECTION,
            storage_path: buildInspectionPhotoPath(OTHER, INSPECTION, "FRENTE", "a.webp"),
          },
        ],
        INSPECTION,
      ),
    ).toThrow(/validar os arquivos/);
  });

  it("aceita conjunto consistente full+thumb derivado", () => {
    const storage_path = buildInspectionPhotoPath(TENANT, INSPECTION, "FRENTE", "a.webp");
    const result = assertPurgePhotoSetIsOwned(
      [{ tenant_id: TENANT, inspection_id: INSPECTION, storage_path }],
      INSPECTION,
    );
    expect(result.paths).toContain(storage_path);
    expect(result.paths).toContain(buildInspectionPhotoThumbnailPath(storage_path));
  });
});

describe("remove idempotente / rollback", () => {
  it("faz rollback só do full se o thumb falhar", async () => {
    const rolled: string[][] = [];
    await expect(
      commitPhotoObjectsWithRollback({
        fullPath: "full.webp",
        thumbPath: "thumb.webp",
        uploadFull: async () => undefined,
        uploadThumb: async () => {
          throw new Error("thumb failed");
        },
        insert: async () => "ok",
        rollback: async (paths) => {
          rolled.push(paths);
        },
      }),
    ).rejects.toThrow("thumb failed");
    expect(rolled).toEqual([["full.webp"]]);
  });

  it("faz rollback de full+thumb se o INSERT falhar", async () => {
    const rolled: string[][] = [];
    await expect(
      commitPhotoObjectsWithRollback({
        fullPath: "full.webp",
        thumbPath: "thumb.webp",
        uploadFull: async () => undefined,
        uploadThumb: async () => undefined,
        insert: async () => {
          throw new Error("insert failed");
        },
        rollback: async (paths) => {
          rolled.push(paths);
        },
      }),
    ).rejects.toThrow("insert failed");
    expect(rolled).toEqual([["full.webp", "thumb.webp"]]);
  });

  it("não mascara o erro original se o rollback falhar", async () => {
    await expect(
      commitPhotoObjectsWithRollback({
        fullPath: "full.webp",
        thumbPath: "thumb.webp",
        uploadFull: async () => undefined,
        uploadThumb: async () => {
          throw new Error("thumb failed");
        },
        insert: async () => "ok",
        rollback: async () => {
          throw new Error("rollback failed");
        },
      }),
    ).rejects.toThrow("thumb failed");
  });

  it("sucesso não chama rollback", async () => {
    const rollback = vi.fn();
    const result = await commitPhotoObjectsWithRollback({
      fullPath: "full.webp",
      thumbPath: "thumb.webp",
      uploadFull: async () => undefined,
      uploadThumb: async () => undefined,
      insert: async () => "row",
      rollback,
    });
    expect(result).toBe("row");
    expect(rollback).not.toHaveBeenCalled();
  });
});

describe("orphan scan (GC futuro, somente leitura)", () => {
  it("lista objetos sem linha ativa", () => {
    const full = `${TENANT}/${INSPECTION}/FRENTE/a.webp`;
    const thumb = buildInspectionPhotoThumbnailPath(full);
    const orphan = `${TENANT}/${INSPECTION}/FRENTE/lost.webp`;
    const names = findOrphanInspectionPhotoObjectNames(
      [{ name: full }, { name: thumb }, { name: orphan }],
      [{ storage_path: full, thumbnail_url: thumb, deleted_at: null }],
    );
    expect(names).toEqual([orphan]);
  });

  it("trata soft-delete como candidato, não como referência ativa", () => {
    const full = `${TENANT}/${INSPECTION}/FRENTE/a.webp`;
    const names = findOrphanInspectionPhotoObjectNames(
      [{ name: full }],
      [{ storage_path: full, deleted_at: "2026-01-01T00:00:00Z" }],
    );
    expect(names).toEqual([full]);
    expect(findSoftDeletedPhotoAssetPaths([{ storage_path: full, deleted_at: "2026-01-01T00:00:00Z" }])).toContain(
      full,
    );
  });

  it("collect não duplica", () => {
    const full = `${TENANT}/${INSPECTION}/FRENTE/a.webp`;
    const paths = collectInspectionPhotoAssetPaths([full, full, ""]);
    expect(paths).toHaveLength(2);
  });
});

describe("offline sync claim", () => {
  it("bloqueia claim recente e libera após TTL", () => {
    const now = Date.parse("2026-09-11T15:00:00.000Z");
    expect(isPhotoSyncClaimHeld("2026-09-11T14:59:00.000Z", now, 120_000)).toBe(true);
    expect(isPhotoSyncClaimHeld("2026-09-11T14:57:00.000Z", now, 120_000)).toBe(false);
    expect(isPhotoSyncClaimHeld(null, now)).toBe(false);
  });
});

describe("limite de upload", () => {
  it("rejeita zero e acima de 2 MB", () => {
    expect(isWithinPhotoUploadLimit(1)).toBe(true);
    expect(isWithinPhotoUploadLimit(2 * 1024 * 1024)).toBe(true);
    expect(isWithinPhotoUploadLimit(2 * 1024 * 1024 + 1)).toBe(false);
    expect(isWithinPhotoUploadLimit(0)).toBe(false);
  });
});
