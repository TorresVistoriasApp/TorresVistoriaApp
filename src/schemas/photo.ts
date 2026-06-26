import { z } from "zod";
import { PHOTO_CATEGORY_KEYS } from "@/lib/photos/photo-catalog";

const photoCategoryEnum = z.enum(PHOTO_CATEGORY_KEYS as [string, ...string[]]);

export const photoUploadSchema = z.object({
  inspection_id: z.string().uuid(),
  category: photoCategoryEnum,
  display_name: z.string().max(200).optional().nullable().or(z.literal("")),
  section_key: z.string().max(100).optional().nullable(),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
  gps_accuracy: z.number().min(0).optional().nullable(),
  damage_location: z.string().max(200).optional().nullable(),
  damage_category: z.string().max(100).optional().nullable(),
  damage_severity: z.enum(["LEVE", "MODERADA", "GRAVE"]).optional().nullable(),
  complementary_name: z.string().max(200).optional().nullable(),
  complementary_category: z.string().max(100).optional().nullable(),
});

export const photoBatchUploadSchema = z
  .array(
    photoUploadSchema.extend({
      file: z.instanceof(File),
    }),
  )
  .max(50, "Máximo 50 fotos por upload");

export type PhotoUploadInput = z.infer<typeof photoUploadSchema>;
export type PhotoBatchUploadInput = z.infer<typeof photoBatchUploadSchema>;

export { PHOTO_CATEGORY_KEYS as PHOTO_CATEGORIES } from "@/lib/photos/photo-catalog";
