import {
  PHOTO_CAPTURE_SECTIONS,
  PHOTO_CATEGORY_MAP,
  photoMatchesCategory,
} from "@/lib/photos/photo-catalog";
import {
  getVisibleCaptureSections,
  getVisibleSectionCategories,
  getVisibleSubsections,
} from "@/lib/photos/photo-capture-visibility";
import { isPhotoCategoryComplete } from "@/lib/photos/photo-progress";
import type { PhotoCaptureContext, PhotoCategoryDefinition } from "@/lib/photos/types";

export type PhotoSequenceItem = {
  sectionKey: string;
  subsectionKey?: string;
  category: PhotoCategoryDefinition;
};

export type PhotoLike = {
  id: string;
  category: string;
};

export function getCategorySlotId(categoryKey: string): string {
  return `photo-slot-${categoryKey.toLowerCase()}`;
}

export function getSectionContainerId(sectionKey: string): string {
  return `fotos-${sectionKey.toLowerCase()}`;
}

/** Monta a sequência linear de captura respeitando visibilidade e subseções. */
export function buildCaptureSequence(context: PhotoCaptureContext): PhotoSequenceItem[] {
  const items: PhotoSequenceItem[] = [];

  for (const section of getVisibleCaptureSections(PHOTO_CAPTURE_SECTIONS, context)) {
    const subsections = getVisibleSubsections(section, context);

    if (subsections.length > 0) {
      for (const subsection of subsections) {
        for (const category of subsection.categories) {
          items.push({
            sectionKey: section.key,
            subsectionKey: subsection.key,
            category,
          });
        }
      }
      continue;
    }

    for (const category of getVisibleSectionCategories(section, context)) {
      items.push({ sectionKey: section.key, category });
    }
  }

  return items;
}

/** Indica se a categoria participa da sequência guiada (slots únicos). */
export function isGuidedCaptureCategory(categoryKey: string): boolean {
  const category = PHOTO_CATEGORY_MAP[categoryKey];
  return category?.type === "SINGLE";
}

/** Primeira fotografia SINGLE pendente na sequência lógica. */
export function findNextRecommendedCategory(
  photos: PhotoLike[],
  context: PhotoCaptureContext,
): string | null {
  for (const item of buildCaptureSequence(context)) {
    if (!isGuidedCaptureCategory(item.category.key)) continue;
    if (!isPhotoCategoryComplete(photos, item.category.key)) {
      return item.category.key;
    }
  }
  return null;
}

export function findSectionKeyForCategory(
  categoryKey: string,
  context: PhotoCaptureContext,
): string | null {
  for (const item of buildCaptureSequence(context)) {
    if (photoMatchesCategory(item.category.key, categoryKey)) {
      return item.sectionKey;
    }
  }
  return PHOTO_CATEGORY_MAP[categoryKey]?.sectionKey ?? null;
}

export function findNextGuidedCategoryAfter(
  categoryKey: string,
  photos: PhotoLike[],
  context: PhotoCaptureContext,
): string | null {
  const sequence = buildCaptureSequence(context);
  const currentIndex = sequence.findIndex((item) =>
    photoMatchesCategory(item.category.key, categoryKey),
  );

  for (let index = currentIndex + 1; index < sequence.length; index += 1) {
    const item = sequence[index]!;
    if (!isGuidedCaptureCategory(item.category.key)) continue;
    if (!isPhotoCategoryComplete(photos, item.category.key)) {
      return item.category.key;
    }
  }

  return null;
}

/** Detecta categorias que passaram a ter foto confirmada desde o snapshot anterior. */
export function findNewlyCompletedCategories(
  previousPhotos: PhotoLike[],
  currentPhotos: PhotoLike[],
  context: PhotoCaptureContext,
): string[] {
  const completed: string[] = [];

  for (const item of buildCaptureSequence(context)) {
    const key = item.category.key;
    if (!isGuidedCaptureCategory(key)) continue;

    const wasComplete = isPhotoCategoryComplete(previousPhotos, key);
    const isComplete = isPhotoCategoryComplete(currentPhotos, key);

    if (!wasComplete && isComplete) {
      completed.push(key);
    }
  }

  return completed;
}

export function scrollToCategorySlot(categoryKey: string): void {
  const element = document.getElementById(getCategorySlotId(categoryKey));
  element?.scrollIntoView({ behavior: "smooth", block: "center" });
}

export function scrollToSection(sectionKey: string): void {
  const element = document.getElementById(getSectionContainerId(sectionKey));
  element?.scrollIntoView({ behavior: "smooth", block: "start" });
}
