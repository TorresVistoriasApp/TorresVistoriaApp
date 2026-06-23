import { z } from "zod";
import { PHOTO_CATEGORIES } from "@/lib/constants";

const photoCategoryEnum = z.enum(PHOTO_CATEGORIES);

export const photoUploadSchema = z.object({
  inspection_id: z.string().uuid(),
  category: photoCategoryEnum,
  description: z.string().max(500).optional().nullable().or(z.literal("")),
  latitude: z.number().min(-90).max(90).optional().nullable(),
  longitude: z.number().min(-180).max(180).optional().nullable(),
});

export const photoBatchUploadSchema = z
  .array(
    photoUploadSchema.extend({
      file: z.instanceof(File),
    }),
  )
  .max(20, "Máximo 20 fotos por upload");

export type PhotoUploadInput = z.infer<typeof photoUploadSchema>;
export type PhotoBatchUploadInput = z.infer<typeof photoBatchUploadSchema>;

export { PHOTO_CATEGORIES } from "@/lib/constants";
