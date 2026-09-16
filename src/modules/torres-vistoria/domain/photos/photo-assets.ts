import { inspectionPhotoAssetPaths } from "@/infra/storage/paths";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const CATEGORY_RE = /^[A-Z0-9][A-Z0-9_]{0,80}$/i;
const FILE_RE = /^[A-Za-z0-9._-]{1,180}\.webp$/;

const AUTH_OR_POLICY_RE =
  /unauthorized|forbidden|permission|rls|row-level|access denied|not authenticated|jwt|policy|invalid token|authentication|privileg/i;

type StorageErrorLike = {
  message?: string;
  statusCode?: string | number;
  status?: string | number;
  error?: string;
  name?: string;
  code?: string;
};

function asStorageError(error: unknown): StorageErrorLike {
  if (typeof error === "string") return { message: error };
  if (!error || typeof error !== "object") return {};
  return error as StorageErrorLike;
}

function combinedErrorText(error: StorageErrorLike): string {
  return [error.message, error.error, error.name, error.code].filter(Boolean).join(" ");
}

function numericStatus(error: StorageErrorLike): number | null {
  const raw = error.statusCode ?? error.status;
  if (raw == null || raw === "") return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

/**
 * Somente ausência comprovada do objeto. Autorização/RLS/desconhecido = falha.
 * O SDK do Storage costuma usar StorageError.statusCode (string) + message.
 */
export function isBenignStorageRemoveError(error: unknown): boolean {
  const parsed = asStorageError(error);
  const text = combinedErrorText(parsed);
  const status = numericStatus(parsed);

  if (status === 401 || status === 403) return false;
  if (AUTH_OR_POLICY_RE.test(text)) return false;

  const code = String(parsed.error ?? parsed.code ?? "").toLowerCase();
  if (code === "not_found" || code === "nosuchkey") return true;

  if (status === 404) {
    return /not found|does not exist|no such|object not found/i.test(text) || text.trim() === "";
  }

  return false;
}

export function isCanonicalUuid(value: string): boolean {
  return UUID_RE.test(value);
}

function hasSuspiciousEncoding(path: string): boolean {
  if (path.includes("%")) return true;
  try {
    if (decodeURIComponent(path) !== path) return true;
  } catch {
    return true;
  }
  return false;
}

export function parseCanonicalInspectionPhotoPath(storagePath: string): {
  tenantId: string;
  inspectionId: string;
  category: string;
  fileName: string;
  isThumbnail: boolean;
} | null {
  if (!storagePath || typeof storagePath !== "string") return null;
  const trimmed = storagePath.trim();
  if (!trimmed || trimmed !== storagePath) return null;
  if (trimmed.startsWith("/") || trimmed.startsWith("\\")) return null;
  if (trimmed.includes("\\") || trimmed.includes("..")) return null;
  if (trimmed.includes("://") || trimmed.includes("?")) return null;
  if (hasSuspiciousEncoding(trimmed)) return null;
  if (trimmed.split("//").length > 1) return null;

  const parts = trimmed.split("/");
  if (parts.some((part) => part.length === 0)) return null;

  const isThumbnail = parts.length === 5 && parts[3] === "thumbs";
  if (!isThumbnail && parts.length !== 4) return null;

  const [tenantId, inspectionId, category, fileOrThumbs, thumbFile] = parts;
  const fileName = isThumbnail ? thumbFile : fileOrThumbs;
  if (!tenantId || !inspectionId || !category || !fileName) return null;
  if (!isCanonicalUuid(tenantId) || !isCanonicalUuid(inspectionId)) return null;
  if (!CATEGORY_RE.test(category)) return null;
  if (!FILE_RE.test(fileName)) return null;

  return { tenantId, inspectionId, category, fileName, isThumbnail };
}

export function photoPathBelongsToInspection(
  storagePath: string,
  tenantId: string,
  inspectionId: string,
): boolean {
  if (!isCanonicalUuid(tenantId) || !isCanonicalUuid(inspectionId)) return false;
  const parsed = parseCanonicalInspectionPhotoPath(storagePath);
  if (!parsed) return false;
  return (
    parsed.tenantId.toLowerCase() === tenantId.toLowerCase() &&
    parsed.inspectionId.toLowerCase() === inspectionId.toLowerCase()
  );
}

export function collectInspectionPhotoAssetPaths(storagePaths: Array<string | null | undefined>): string[] {
  const unique = new Set<string>();
  for (const path of storagePaths) {
    if (!path) continue;
    for (const asset of inspectionPhotoAssetPaths(path)) {
      unique.add(asset);
    }
  }
  return [...unique];
}

export function filterInspectionOwnedPhotoPaths(
  storagePaths: Array<string | null | undefined>,
  tenantId: string,
  inspectionId: string,
): string[] {
  return collectInspectionPhotoAssetPaths(storagePaths).filter((path) =>
    photoPathBelongsToInspection(path, tenantId, inspectionId),
  );
}

export class PhotoPathMismatchError extends Error {
  constructor(message = "O caminho da foto não corresponde ao registro.") {
    super(message);
    this.name = "PhotoPathMismatchError";
  }
}

export type PhotoRemovalRow = {
  id: string;
  tenant_id: string;
  inspection_id: string;
  storage_path: string;
  deleted_at?: string | null;
};

/** Fonte de verdade = linha do banco. Path da UI é só checagem opcional. */
export function resolvePhotoRemovalTargets(
  row: PhotoRemovalRow | null,
  claimedStoragePath?: string | null,
): { skip: boolean; paths: string[] } {
  if (!row) {
    throw new Error("Foto não encontrada.");
  }
  if (row.deleted_at) {
    return { skip: true, paths: [] };
  }
  if (
    claimedStoragePath != null &&
    claimedStoragePath !== "" &&
    claimedStoragePath !== row.storage_path
  ) {
    throw new PhotoPathMismatchError();
  }
  if (!photoPathBelongsToInspection(row.storage_path, row.tenant_id, row.inspection_id)) {
    throw new Error("Caminho de armazenamento da foto é inválido.");
  }
  return { skip: false, paths: inspectionPhotoAssetPaths(row.storage_path) };
}

export function assertPurgePhotoSetIsOwned(
  photos: Array<{ tenant_id: string; inspection_id: string; storage_path: string }>,
  inspectionId: string,
): { tenantId: string; paths: string[] } {
  if (photos.length === 0) {
    return { tenantId: "", paths: [] };
  }
  const tenantId = photos[0]?.tenant_id ?? "";
  for (const photo of photos) {
    if (photo.inspection_id !== inspectionId) {
      throw new Error("Foto não pertence à vistoria informada.");
    }
    if (photo.tenant_id !== tenantId) {
      throw new Error("Conjunto de fotos com tenant inconsistente.");
    }
    if (!photoPathBelongsToInspection(photo.storage_path, tenantId, inspectionId)) {
      throw new Error("Não foi possível validar os arquivos da vistoria para exclusão.");
    }
  }
  return {
    tenantId,
    paths: filterInspectionOwnedPhotoPaths(
      photos.map((photo) => photo.storage_path),
      tenantId,
      inspectionId,
    ),
  };
}

/**
 * Upload sequencial com rollback apenas dos paths desta operação.
 * O erro original é relançado; falha no rollback não o mascara.
 */
export async function commitPhotoObjectsWithRollback<T>(options: {
  fullPath: string;
  thumbPath: string;
  uploadFull: () => Promise<void>;
  uploadThumb: () => Promise<void>;
  insert: () => Promise<T>;
  rollback: (createdPaths: string[]) => Promise<void>;
}): Promise<T> {
  const created: string[] = [];
  try {
    await options.uploadFull();
    created.push(options.fullPath);
    await options.uploadThumb();
    created.push(options.thumbPath);
    return await options.insert();
  } catch (error) {
    try {
      if (created.length > 0) await options.rollback(created);
    } catch {
      // best-effort: o erro de negócio permanece
    }
    throw error;
  }
}

export type PhotoRowForOrphanScan = {
  storage_path: string;
  thumbnail_url?: string | null;
  deleted_at?: string | null;
};

export type StorageObjectForOrphanScan = {
  name: string;
};

/** Candidatos a GC futuro — não apaga nada. Inclui objetos de fotos soft-deleted. */
export function findOrphanInspectionPhotoObjectNames(
  objects: StorageObjectForOrphanScan[],
  photoRows: PhotoRowForOrphanScan[],
): string[] {
  const referenced = new Set<string>();
  for (const row of photoRows) {
    if (row.deleted_at) continue;
    for (const path of collectInspectionPhotoAssetPaths([row.storage_path, row.thumbnail_url])) {
      referenced.add(path);
    }
  }

  return objects
    .map((object) => object.name)
    .filter((name) => name.endsWith(".webp"))
    .filter((name) => !referenced.has(name));
}

export function findSoftDeletedPhotoAssetPaths(photoRows: PhotoRowForOrphanScan[]): string[] {
  return collectInspectionPhotoAssetPaths(
    photoRows.filter((row) => Boolean(row.deleted_at)).flatMap((row) => [row.storage_path, row.thumbnail_url]),
  );
}

export const PHOTO_SYNC_CLAIM_TTL_MS = 120_000;

export function isPhotoSyncClaimHeld(
  claimedAt: string | null | undefined,
  nowMs: number,
  ttlMs = PHOTO_SYNC_CLAIM_TTL_MS,
): boolean {
  if (!claimedAt) return false;
  const started = Date.parse(claimedAt);
  if (!Number.isFinite(started)) return false;
  return nowMs - started < ttlMs;
}
