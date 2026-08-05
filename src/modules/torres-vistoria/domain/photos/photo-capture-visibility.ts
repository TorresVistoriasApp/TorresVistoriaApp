import type {
  PhotoCaptureContext,
  PhotoCategoryDefinition,
  PhotoSectionDefinition,
  PhotoSubsectionDefinition,
  PhotoVisibilityCondition,
} from "@/modules/torres-vistoria/domain/photos/types";

export const DEFAULT_PHOTO_CAPTURE_CONTEXT: PhotoCaptureContext = {
  isArmored: false,
};

/** Dados mínimos da vistoria para resolver blindagem (sem acoplar ao service). */
export type PhotoCaptureInspectionContext = {
  is_armored?: boolean | null;
  vehicle_condition?: string | null;
};

export function resolveIsArmoredFromInspection(
  inspection: PhotoCaptureInspectionContext | null | undefined,
): boolean {
  if (inspection?.is_armored === true) return true;

  const condition = inspection?.vehicle_condition?.trim().toLowerCase() ?? "";
  return /\bblind/.test(condition);
}

export function createPhotoCaptureContext(
  inspection?: PhotoCaptureInspectionContext | null,
): PhotoCaptureContext {
  return {
    isArmored: resolveIsArmoredFromInspection(inspection),
  };
}

export function isVisibilityConditionMet(
  condition: PhotoVisibilityCondition | undefined,
  context: PhotoCaptureContext,
): boolean {
  if (!condition) return true;

  switch (condition) {
    case "armored":
      return context.isArmored;
    default:
      return true;
  }
}

export function getVisibleSubsections(
  section: PhotoSectionDefinition,
  context: PhotoCaptureContext = DEFAULT_PHOTO_CAPTURE_CONTEXT,
): PhotoSubsectionDefinition[] {
  return (section.subsections ?? []).filter((subsection) =>
    isVisibilityConditionMet(subsection.visibleWhen, context),
  );
}

export function getSectionCategories(section: PhotoSectionDefinition): PhotoCategoryDefinition[] {
  if (section.subsections?.length) {
    return section.subsections.flatMap((subsection) => subsection.categories);
  }
  return section.categories;
}

export function getVisibleSectionCategories(
  section: PhotoSectionDefinition,
  context: PhotoCaptureContext = DEFAULT_PHOTO_CAPTURE_CONTEXT,
): PhotoCategoryDefinition[] {
  if (!isVisibilityConditionMet(section.visibleWhen, context)) {
    return [];
  }

  if (section.subsections?.length) {
    return getVisibleSubsections(section, context).flatMap((subsection) =>
      subsection.categories.filter((category) =>
        isVisibilityConditionMet(category.visibleWhen, context),
      ),
    );
  }

  return section.categories.filter((category) =>
    isVisibilityConditionMet(category.visibleWhen, context),
  );
}

export function getVisibleCaptureSections(
  sections: PhotoSectionDefinition[],
  context: PhotoCaptureContext = DEFAULT_PHOTO_CAPTURE_CONTEXT,
): PhotoSectionDefinition[] {
  return sections.filter((section) => isVisibilityConditionMet(section.visibleWhen, context));
}
