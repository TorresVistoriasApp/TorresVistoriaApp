import {
  ALL_PHOTO_CATEGORIES,
  MANDATORY_PHOTO_CATEGORY_KEYS,
  PHOTO_CAPTURE_SECTIONS,
  PHOTO_CATALOG,
  getPhotoCategoryLabel,
  photoMatchesCategory,
} from "@/lib/photos/photo-catalog";
import {
  DEFAULT_PHOTO_CAPTURE_CONTEXT,
  getVisibleCaptureSections,
  getVisibleSectionCategories,
} from "@/lib/photos/photo-capture-visibility";
import {
  PHOTO_REQUIREMENTS_ENABLED,
  isPhotoRequirementActive,
} from "@/lib/photos/photo-requirements-flag";
import type {
  PhotoCaptureContext,
  PhotoCaptureProgress,
  PhotoSectionProgress,
  PhotoSectionStatus,
} from "@/lib/photos/types";

type PhotoLike = {
  id: string;
  category: string;
};

export function isPendingPhotoId(id: string): boolean {
  return id.startsWith("pending-");
}

function countPhotosForCategory(photos: PhotoLike[], categoryKey: string): number {
  return photos.filter(
    (photo) => !isPendingPhotoId(photo.id) && photoMatchesCategory(photo.category, categoryKey),
  ).length;
}

function isCategoryComplete(photos: PhotoLike[], categoryKey: string): boolean {
  const def = ALL_PHOTO_CATEGORIES.find((c) => c.key === categoryKey);
  if (!def) return false;

  const count = countPhotosForCategory(photos, categoryKey);
  if (def.type === "SINGLE") return count >= def.minCount;
  if (def.type === "MULTI" || def.type === "DAMAGE" || def.type === "COMPLEMENTARY") {
    return def.required ? count >= def.minCount : count > 0 || def.minCount === 0;
  }
  return count >= def.minCount;
}

function resolveSectionStatus(
  completedRequired: number,
  totalRequired: number,
  hasAnyPhoto: boolean,
): PhotoSectionStatus {
  if (totalRequired === 0) {
    return hasAnyPhoto ? "COMPLETED" : "PENDING";
  }
  if (completedRequired >= totalRequired) return "COMPLETED";
  if (completedRequired > 0 || hasAnyPhoto) return "IN_PROGRESS";
  return "PENDING";
}

export function computeSectionProgress(
  sectionKey: string,
  photos: PhotoLike[],
  context: PhotoCaptureContext = DEFAULT_PHOTO_CAPTURE_CONTEXT,
): PhotoSectionProgress {
  const section = PHOTO_CATALOG.find((s) => s.key === sectionKey);
  if (!section) {
    return {
      sectionKey,
      status: "PENDING",
      totalCategories: 0,
      completedCategories: 0,
      totalPhotos: 0,
      requiredPhotos: 0,
      completedPhotos: 0,
      remainingPhotos: 0,
      percentComplete: 0,
      estimatedSecondsRemaining: 0,
    };
  }

  const visibleCategories = getVisibleSectionCategories(section, context);
  const requiredCategories = visibleCategories.filter(
    (c) => isPhotoRequirementActive(c.required) && c.type === "SINGLE",
  );
  const completedCategories = requiredCategories.filter((c) =>
    isCategoryComplete(photos, c.key),
  ).length;

  const totalPhotos = visibleCategories.reduce(
    (sum, c) => sum + countPhotosForCategory(photos, c.key),
    0,
  );

  const requiredPhotos = requiredCategories.length;
  const completedPhotos = completedCategories;
  const remainingPhotos = Math.max(0, requiredPhotos - completedPhotos);
  const percentComplete =
    requiredPhotos > 0 ? Math.round((completedPhotos / requiredPhotos) * 100) : totalPhotos > 0 ? 100 : 0;

  const estimatedSecondsRemaining = visibleCategories
    .filter(
      (c) =>
        isPhotoRequirementActive(c.required) &&
        c.type === "SINGLE" &&
        !isCategoryComplete(photos, c.key),
    )
    .reduce((sum, c) => sum + (c.estimatedCaptureSeconds ?? 25), 0);

  return {
    sectionKey: section.key,
    status: resolveSectionStatus(completedPhotos, requiredPhotos, totalPhotos > 0),
    totalCategories: visibleCategories.length,
    completedCategories,
    totalPhotos,
    requiredPhotos,
    completedPhotos,
    remainingPhotos,
    percentComplete,
    estimatedSecondsRemaining,
  };
}

export function computeCaptureProgress(
  photos: PhotoLike[],
  context: PhotoCaptureContext = DEFAULT_PHOTO_CAPTURE_CONTEXT,
): PhotoCaptureProgress {
  const visibleSections = getVisibleCaptureSections(PHOTO_CAPTURE_SECTIONS, context);
  const sections = visibleSections.map((section) =>
    computeSectionProgress(section.key, photos, context),
  );

  const mandatoryKeys = PHOTO_REQUIREMENTS_ENABLED ? MANDATORY_PHOTO_CATEGORY_KEYS : [];
  const totalRequired = mandatoryKeys.length;
  const totalCompleted = mandatoryKeys.filter((key) => isCategoryComplete(photos, key)).length;
  const percentComplete =
    totalRequired > 0 ? Math.round((totalCompleted / totalRequired) * 100) : 100;

  const missingRequiredLabels = PHOTO_REQUIREMENTS_ENABLED
    ? mandatoryKeys
        .filter((key) => !isCategoryComplete(photos, key))
        .map((key) => getPhotoCategoryLabel(key))
    : [];

  const estimatedSecondsRemaining = sections.reduce(
    (sum, s) => sum + s.estimatedSecondsRemaining,
    0,
  );

  return {
    sections,
    totalRequired,
    totalCompleted,
    percentComplete,
    estimatedSecondsRemaining,
    canProceed: !PHOTO_REQUIREMENTS_ENABLED || missingRequiredLabels.length === 0,
    missingRequiredLabels,
  };
}

export function formatEstimatedTime(seconds: number): string {
  if (seconds <= 0) return "Concluído";
  if (seconds < 60) return `~${seconds}s restantes`;
  const minutes = Math.ceil(seconds / 60);
  return minutes === 1 ? "~1 min restante" : `~${minutes} min restantes`;
}

export function getSectionStatusLabel(status: PhotoSectionStatus): string {
  switch (status) {
    case "COMPLETED":
      return "Concluído";
    case "IN_PROGRESS":
      return "Em andamento";
    case "NEEDS_REVIEW":
      return "Requer revisão";
    default:
      return "Pendente";
  }
}
