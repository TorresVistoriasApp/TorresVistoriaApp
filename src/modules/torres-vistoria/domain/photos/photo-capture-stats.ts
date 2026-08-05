import { buildCaptureSequence, isGuidedCaptureCategory } from "@/modules/torres-vistoria/domain/photos/photo-capture-sequence";
import type { PhotoCaptureContext } from "@/modules/torres-vistoria/domain/photos/types";
import { isPhotoCategoryComplete, isPendingPhotoId } from "@/modules/torres-vistoria/domain/photos/photo-progress";

type PhotoLike = { id: string; category: string };

export type PhotoCaptureStats = {
  totalSlots: number;
  completedSlots: number;
  remainingSlots: number;
  percentComplete: number;
  totalPhotos: number;
};

export function computePhotoCaptureStats(
  photos: PhotoLike[],
  context: PhotoCaptureContext,
): PhotoCaptureStats {
  const confirmed = photos.filter((photo) => !isPendingPhotoId(photo.id));
  const sequence = buildCaptureSequence(context);
  const singleSlots = sequence.filter((item) => isGuidedCaptureCategory(item.category.key));

  const totalSlots = singleSlots.length;
  const completedSlots = singleSlots.filter((item) =>
    isPhotoCategoryComplete(confirmed, item.category.key),
  ).length;
  const remainingSlots = Math.max(0, totalSlots - completedSlots);
  const percentComplete =
    totalSlots > 0 ? Math.round((completedSlots / totalSlots) * 100) : 0;

  return {
    totalSlots,
    completedSlots,
    remainingSlots,
    percentComplete,
    totalPhotos: confirmed.length,
  };
}
