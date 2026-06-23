import { supabase } from "@/lib/supabase";
import { queries } from "@/lib/queries";
import { mutations } from "@/lib/mutations";
import {
  buildPhotoPath,
  compressToWebP,
  STORAGE_BUCKET,
} from "@/lib/compress-image";
import { AppError, getErrorMessage, throwIfError } from "@/lib/errors";

export type InspectionPhoto = {
  id: string;
  inspection_id: string;
  company_id: string;
  category: string;
  storage_path: string;
  public_url: string | null;
  file_size: number | null;
  mime_type: string;
  latitude: number | null;
  longitude: number | null;
  watermark_applied: boolean;
  created_at: string;
};

export const photoService = {
  async listByInspection(inspectionId: string): Promise<InspectionPhoto[]> {
    try {
      const { data, error } = await queries.photos.byInspection(inspectionId);
      if (error) throw error;
      return (data ?? []) as InspectionPhoto[];
    } catch (error) {
      throw new AppError(getErrorMessage(error));
    }
  },

  async upload(
    file: File,
    params: {
      companyId: string;
      inspectionId: string;
      category: string;
      latitude?: number | null;
      longitude?: number | null;
    },
  ): Promise<InspectionPhoto> {
    try {
      const webp = await compressToWebP(file);
      const fileName = `${Date.now()}.webp`;
      const storagePath = buildPhotoPath(
        params.companyId,
        params.inspectionId,
        params.category,
        fileName,
      );

      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(storagePath, webp, { contentType: "image/webp", upsert: false });
      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(storagePath);

      return throwIfError(
        await mutations.photos.create({
          company_id: params.companyId,
          inspection_id: params.inspectionId,
          category: params.category,
          storage_path: storagePath,
          public_url: urlData.publicUrl,
          file_size: webp.size,
          mime_type: "image/webp",
          latitude: params.latitude ?? null,
          longitude: params.longitude ?? null,
        }),
        "Erro ao registrar foto",
      ) as InspectionPhoto;
    } catch (error) {
      throw new AppError(getErrorMessage(error));
    }
  },

  async remove(id: string, storagePath: string): Promise<void> {
    try {
      await supabase.storage.from(STORAGE_BUCKET).remove([storagePath]);
      const { error } = await mutations.photos.softDelete(id);
      if (error) throw error;
    } catch (error) {
      throw new AppError(getErrorMessage(error));
    }
  },
};
