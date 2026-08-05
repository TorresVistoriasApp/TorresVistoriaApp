import { db } from "@/infra/supabase/client";
import { getSignedUrl, getSignedUrls } from "@/infra/storage/signed-url";
import type {
  FileStoragePort,
  StoredFile,
  UploadOptions,
} from "@/core/integrations/ports/file-storage";
import type { IntegrationResult } from "@/core/integrations/ports/shared";

/** Adaptador da porta de storage sobre o Supabase Storage. */
export const supabaseFileStorage: FileStoragePort = {
  async upload(
    bucket: string,
    path: string,
    file: Blob,
    options?: UploadOptions,
  ): Promise<IntegrationResult<StoredFile>> {
    const contentType = options?.contentType ?? file.type ?? "application/octet-stream";

    const { error } = await db.storage.from(bucket).upload(path, file, {
      contentType,
      upsert: options?.upsert ?? false,
    });

    if (error) {
      return { ok: false, code: "storage.upload_failed", message: error.message };
    }

    return {
      ok: true,
      data: { path, bucket, sizeInBytes: file.size, contentType },
    };
  },

  async remove(bucket: string, paths: string[]): Promise<IntegrationResult<void>> {
    const { error } = await db.storage.from(bucket).remove(paths);
    if (error) {
      return { ok: false, code: "storage.remove_failed", message: error.message };
    }
    return { ok: true, data: undefined };
  },

  getSignedUrl,
  getSignedUrls,
};
