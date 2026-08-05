import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PHOTO_CAPTURE_SECTIONS } from "@/modules/torres-vistoria/domain/photos/photo-catalog";
import {
  createPhotoCaptureContext,
  getVisibleCaptureSections,
  type PhotoCaptureInspectionContext,
} from "@/modules/torres-vistoria/domain/photos/photo-capture-visibility";
import {
  findNewlyCompletedCategories,
  findNextGuidedCategoryAfter,
  findNextRecommendedCategory,
  findSectionKeyForCategory,
  scrollToCategorySlot,
  type PhotoLike,
} from "@/modules/torres-vistoria/domain/photos/photo-capture-sequence";
import { computeCaptureProgress, computeSectionProgress } from "@/modules/torres-vistoria/domain/photos/photo-progress";
import type { PhotoCaptureContext, PhotoCaptureProgress, PhotoSectionDefinition } from "@/modules/torres-vistoria/domain/photos/types";

function buildInitialOpenSections(
  sections: PhotoSectionDefinition[],
  photos: PhotoLike[],
  context: PhotoCaptureContext,
): Record<string, boolean> {
  const openState: Record<string, boolean> = {};

  for (const section of sections) {
    openState[section.key] = false;
  }

  const nextCategory = findNextRecommendedCategory(photos, context);
  const activeSectionKey = nextCategory
    ? findSectionKeyForCategory(nextCategory, context)
    : sections[0]?.key;

  if (activeSectionKey) {
    openState[activeSectionKey] = true;
    return openState;
  }

  if (sections[0]) {
    openState[sections[0].key] = sections[0].defaultOpen ?? true;
  }

  return openState;
}

type UsePhotoCaptureFlowOptions = {
  photos: PhotoLike[];
  inspection?: PhotoCaptureInspectionContext | null;
};

export function usePhotoCaptureFlow({ photos, inspection }: UsePhotoCaptureFlowOptions) {
  const captureContext = useMemo(
    () => createPhotoCaptureContext(inspection),
    [inspection],
  );

  const visibleSections = useMemo(
    () => getVisibleCaptureSections(PHOTO_CAPTURE_SECTIONS, captureContext),
    [captureContext],
  );

  const captureProgress = useMemo(
    () => computeCaptureProgress(photos, captureContext),
    [photos, captureContext],
  );

  const recommendedCategoryKey = useMemo(
    () => findNextRecommendedCategory(photos, captureContext),
    [photos, captureContext],
  );

  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() =>
    buildInitialOpenSections(visibleSections, photos, captureContext),
  );

  const previousPhotosRef = useRef(photos);
  const hasInitializedSectionsRef = useRef(false);

  const setSectionOpen = useCallback((sectionKey: string, open: boolean) => {
    setOpenSections((current) => ({ ...current, [sectionKey]: open }));
  }, []);

  const advanceAfterCapture = useCallback(
    (capturedCategoryKey: string, currentPhotos: PhotoLike[]) => {
      const sectionKey = findSectionKeyForCategory(capturedCategoryKey, captureContext);
      if (!sectionKey) return;

      const sectionProgress = computeSectionProgress(sectionKey, currentPhotos, captureContext);
      const nextCategoryKey = findNextGuidedCategoryAfter(
        capturedCategoryKey,
        currentPhotos,
        captureContext,
      );
      const nextSectionKey = nextCategoryKey
        ? findSectionKeyForCategory(nextCategoryKey, captureContext)
        : null;

      setOpenSections((current) => {
        const next = { ...current };

        if (sectionProgress.status === "COMPLETED") {
          next[sectionKey] = false;
        }

        if (nextSectionKey) {
          next[nextSectionKey] = true;
        }

        return next;
      });

      window.setTimeout(() => {
        if (nextCategoryKey) {
          scrollToCategorySlot(nextCategoryKey);
          return;
        }

        if (sectionProgress.status === "COMPLETED" && nextSectionKey) {
          scrollToCategorySlot(
            findNextRecommendedCategory(currentPhotos, captureContext) ?? capturedCategoryKey,
          );
        }
      }, 280);
    },
    [captureContext],
  );

  useEffect(() => {
    if (!hasInitializedSectionsRef.current && visibleSections.length > 0) {
      setOpenSections(buildInitialOpenSections(visibleSections, photos, captureContext));
      hasInitializedSectionsRef.current = true;
    }
  }, [visibleSections, photos, captureContext]);

  useEffect(() => {
    const previousPhotos = previousPhotosRef.current;
    const newlyCompleted = findNewlyCompletedCategories(previousPhotos, photos, captureContext);

    if (newlyCompleted.length > 0) {
      advanceAfterCapture(newlyCompleted[newlyCompleted.length - 1]!, photos);
    }

    previousPhotosRef.current = photos;
  }, [photos, captureContext, advanceAfterCapture]);

  return {
    captureContext,
    captureProgress,
    visibleSections,
    recommendedCategoryKey,
    openSections,
    setSectionOpen,
    isSectionOpen: (sectionKey: string) => openSections[sectionKey] ?? false,
  };
}

export type PhotoCaptureFlowState = {
  captureProgress: PhotoCaptureProgress;
  recommendedCategoryKey: string | null;
};
