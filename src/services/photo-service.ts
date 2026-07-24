import { db } from "@/lib/db-client";
import { queries } from "@/lib/queries";
import { mutations } from "@/lib/mutations";
import {
  buildPhotoPath,
  extractImageMetadata,
  getDeviceInfo,
  preparePhotoForUpload,
  STORAGE_BUCKET,
} from "@/lib/compress-image";
import { runPhotoUpload } from "@/lib/photos/upload-queue";
import { getPhotoCategory, normalizePhotoCategory } from "@/lib/photos/photo-catalog";
import { insertInspectionPhoto } from "@/lib/photos/photo-insert";
import type { PhotoCaptureMetadata, PhotoCaptureStatus } from "@/lib/photos/types";
import { withFreshSession } from "@/lib/ensure-session";
import { getSignedUrl, getSignedUrls } from "@/lib/storage-url";
import { AppError, getErrorMessage, throwIfError } from "@/lib/errors";
import { formatUserFacingError } from "@/lib/user-facing-errors";

export type InspectionPhoto = {
  id: string;
  inspection_id: string;
  company_id: string;
  category: string;
  section_key: string | null;
  subcategory: string | null;
  display_name: string | null;
  sort_order: number | null;
  is_required: boolean | null;
  storage_path: string;
  public_url: string | null;
  thumbnail_url: string | null;
  file_size: number | null;
  mime_type: string;
  content_hash: string | null;
  width: number | null;
  height: number | null;
  resolution: string | null;
  latitude: number | null;
  longitude: number | null;
  gps_accuracy: number | null;
  captured_at: string | null;
  device_model: string | null;
  device_os: string | null;
  uploaded_by: string | null;
  status: PhotoCaptureStatus | string | null;
  damage_location: string | null;
  damage_category: string | null;
  damage_severity: string | null;
  complementary_name: string | null;
  complementary_category: string | null;
  ai_validation: Record<string, unknown> | null;
  watermark_applied: boolean;
  created_at: string;
  updated_at?: string;
};

export type PhotoUploadParams = {
  companyId: string;
  inspectionId: string;
  category: string;
  latitude?: number | null;
  longitude?: number | null;
  gpsAccuracy?: number | null;
  uploadedBy?: string | null;
  metadata?: Partial<PhotoCaptureMetadata>;
};

function resolveCategoryMeta(category: string) {
  const normalized = normalizePhotoCategory(category);
  const def = getPhotoCategory(normalized);
  return {
    normalizedCategory: normalized,
    sectionKey: def?.sectionKey ?? null,
    displayName: def?.name ?? null,
    isRequired: def?.required ?? true,
    sortOrder: def?.sortOrder ?? 0,
  };
}

/**
 * O bucket de fotos é privado, então public_url gravada no banco não abre.
 * Toda leitura reescreve as URLs a partir do storage_path com assinatura válida.
 */
export async function withSignedPhotoUrls<T extends Pick<InspectionPhoto, "storage_path" | "public_url" | "thumbnail_url">>(
  photos: T[],
): Promise<T[]> {
  if (photos.length === 0) return photos;

  const signed = await getSignedUrls(
    STORAGE_BUCKET,
    photos.map((photo) => photo.storage_path),
  );

  return photos.map((photo) => {
    const url = signed.get(photo.storage_path) ?? null;
    return { ...photo, public_url: url, thumbnail_url: url };
  });
}

export const photoService = {
  async listByInspection(inspectionId: string): Promise<InspectionPhoto[]> {
    try {
      const { data, error } = await queries.photos.byInspection(inspectionId);
      if (error) throw error;
      return withSignedPhotoUrls((data ?? []) as InspectionPhoto[]);
    } catch (error) {
      throw new AppError(getErrorMessage(error));
    }
  },

  async upload(file: File, params: PhotoUploadParams): Promise<InspectionPhoto> {
    try {
      return await runPhotoUpload(async () => {
        const webp = await preparePhotoForUpload(file);

        return withFreshSession(async () => {
          const imageMeta = await extractImageMetadata(webp);
          const device = getDeviceInfo();
          const categoryMeta = resolveCategoryMeta(params.category);
          const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.webp`;
          const storagePath = buildPhotoPath(
            params.companyId,
            params.inspectionId,
            categoryMeta.normalizedCategory,
            fileName,
          );

          const { error: uploadError } = await db.storage
            .from(STORAGE_BUCKET)
            .upload(storagePath, webp, { contentType: "image/webp", upsert: false });
          if (uploadError) throw uploadError;

          // Valor transitório só para a UI logo após o upload; toda leitura
          // posterior reassina a partir do storage_path.
          const signedUrl = await getSignedUrl(STORAGE_BUCKET, storagePath);
          const now = new Date().toISOString();

          const insertResult = await insertInspectionPhoto({
            company_id: params.companyId,
            inspection_id: params.inspectionId,
            category: categoryMeta.normalizedCategory,
            section_key: params.metadata?.sectionKey ?? categoryMeta.sectionKey,
            subcategory: params.metadata?.subcategory ?? null,
            display_name: params.metadata?.displayName ?? categoryMeta.displayName,
            sort_order: params.metadata?.sortOrder ?? categoryMeta.sortOrder,
            is_required: params.metadata?.isRequired ?? categoryMeta.isRequired,
            storage_path: storagePath,
            public_url: signedUrl ?? "",
            thumbnail_url: signedUrl,
            file_size: webp.size,
            mime_type: "image/webp",
            content_hash: imageMeta.contentHash,
            width: imageMeta.width,
            height: imageMeta.height,
            resolution: imageMeta.resolution,
            latitude: params.latitude ?? null,
            longitude: params.longitude ?? null,
            gps_accuracy: params.gpsAccuracy ?? null,
            captured_at: params.metadata?.capturedAt ?? now,
            device_model: params.metadata?.deviceModel ?? device.deviceModel,
            device_os: params.metadata?.deviceOs ?? device.deviceOs,
            uploaded_by: params.uploadedBy ?? null,
            status: params.metadata?.status ?? "CAPTURED",
            damage_location: params.metadata?.damageLocation ?? null,
            damage_category: params.metadata?.damageCategory ?? null,
            damage_severity: params.metadata?.damageSeverity ?? null,
            complementary_name: params.metadata?.complementaryName ?? null,
            complementary_category: params.metadata?.complementaryCategory ?? null,
            ai_validation: params.metadata?.aiValidation ?? {},
          });

          return throwIfError(insertResult, "Erro ao registrar foto") as InspectionPhoto;
        });
      });
    } catch (error) {
      throw new AppError(formatUserFacingError(getErrorMessage(error)));
    }
  },

  async remove(id: string, storagePath: string): Promise<void> {
    try {
      await withFreshSession(async () => {
        const { error: storageError } = await db.storage.from(STORAGE_BUCKET).remove([storagePath]);
        if (storageError) throw storageError;

        const { error } = await mutations.photos.softDelete(id);
        if (error) throw error;
      });
    } catch (error) {
      throw new AppError(formatUserFacingError(getErrorMessage(error)));
    }
  },
};
