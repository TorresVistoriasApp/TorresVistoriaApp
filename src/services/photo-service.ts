import { supabase } from "@/lib/supabase";
import {
  buildPhotoPath,
  compressToWebP,
  STORAGE_BUCKET,
} from "@/lib/compress-image";

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
    const { data, error } = await supabase
      .from("inspection_photos")
      .select("*")
      .eq("inspection_id", inspectionId)
      .is("deleted_at", null)
      .order("created_at");
    if (error) throw error;
    return (data ?? []) as InspectionPhoto[];
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

    const { data, error } = await supabase
      .from("inspection_photos")
      .insert({
        company_id: params.companyId,
        inspection_id: params.inspectionId,
        category: params.category,
        storage_path: storagePath,
        public_url: urlData.publicUrl,
        file_size: webp.size,
        mime_type: "image/webp",
        latitude: params.latitude ?? null,
        longitude: params.longitude ?? null,
        watermark_applied: true,
      })
      .select("*")
      .single();
    if (error) throw error;
    return data as InspectionPhoto;
  },

  async remove(id: string, storagePath: string): Promise<void> {
    await supabase.storage.from(STORAGE_BUCKET).remove([storagePath]);
    const { error } = await supabase
      .from("inspection_photos")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);
    if (error) throw error;
  },
};
