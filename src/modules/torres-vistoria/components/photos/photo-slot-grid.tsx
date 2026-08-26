import { useMemo, useState, type ReactNode } from "react";
import { RotateCcw, X } from "lucide-react";
import { PhotoGuideCard, PHOTO_SLOT_GRID_CLASS } from "@/modules/torres-vistoria/components/photos/photo-guide-card";
import { PhotoDamageGallery } from "@/modules/torres-vistoria/components/photos/photo-damage-gallery";
import { PhotoDamageCaptureSheet } from "@/modules/torres-vistoria/components/photos/photo-damage-capture-sheet";
import { PhotoPaintTestActionSheet } from "@/modules/torres-vistoria/components/photos/photo-paint-test-action-sheet";
import { PhotoSectionCard } from "@/modules/torres-vistoria/components/photos/photo-section-card";
import { PhotoSubsectionPanel } from "@/modules/torres-vistoria/components/photos/photo-subsection-panel";
import { PhotoCaptureProgressSummary } from "@/modules/torres-vistoria/components/photos/photo-section-progress";
import { PhotoActionSheet } from "@/modules/torres-vistoria/draft/components/photo-action-sheet";
import { Button } from "@/shared/ui/button";
import { usePhotoCaptureFlow } from "@/modules/torres-vistoria/hooks/use-photo-capture-flow";
import { isPendingPhoto } from "@/modules/torres-vistoria/hooks/use-photos";
import { pickImageFiles } from "@/shared/lib/pick-image-files";
import {
  AVARIA_CATEGORY_KEY,
  buildDamageCaptureMetadata,
  formatDamagePhotoCaption,
  formatDamagePhotoSummary,
  isDamageCategory,
  type DamageCaptureForm,
} from "@/modules/torres-vistoria/domain/photos/avarias";
import { computePhotoCaptureStats } from "@/modules/torres-vistoria/domain/photos/photo-capture-stats";
import {
  getCategorySlotId,
  getSectionContainerId,
} from "@/modules/torres-vistoria/domain/photos/photo-capture-sequence";
import {
  type PhotoCategoryDefinition,
  photoMatchesCategory,
} from "@/modules/torres-vistoria/domain/photos/photo-catalog";
import type { PhotoCaptureInspectionContext } from "@/modules/torres-vistoria/domain/photos/photo-capture-visibility";
import { getVisibleSubsections } from "@/modules/torres-vistoria/domain/photos/photo-capture-visibility";
import {
  groupFotosExtrasCategories,
  SECTION_UI_GUIDANCE,
} from "@/modules/torres-vistoria/domain/photos/fotos-extras-ui";
import {
  buildPaintTestDisplayName,
  isQuadrosPortasTestCategory,
  QDP_TESTE_PINTURA_CATEGORY_KEYS,
  type PaintTestMethod,
} from "@/modules/torres-vistoria/domain/photos/quadros-portas";
import { getVisibleSectionCategories } from "@/modules/torres-vistoria/domain/photos/photo-capture-visibility";
import type { PhotoCaptureMetadata, PhotoGuideCardStatus, PhotoSectionDefinition } from "@/modules/torres-vistoria/domain/photos/types";
import type { InspectionPhoto } from "@/modules/torres-vistoria/services/photo-service";
import { isPhotoCategoryComplete } from "@/modules/torres-vistoria/domain/photos/photo-progress";

interface PhotoSlotGridProps {
  photos: InspectionPhoto[];
  inspection?: PhotoCaptureInspectionContext | null;
  onUpload: (file: File, category: string, metadata?: Partial<PhotoCaptureMetadata>) => void;
  onDelete?: (photo: InspectionPhoto) => void;
  onPickError?: (message: string) => void;
}

type PhotoPreviewState = {
  url: string;
  category: PhotoCategoryDefinition;
  photo: InspectionPhoto;
};

type PhotoActionState = {
  categoryKey: string;
  categoryName: string;
  multiple: boolean;
  isPaintTest: boolean;
  isDamage: boolean;
  damageIndex?: number;
};

function getPhotosForCategory(
  photos: InspectionPhoto[],
  categoryKey: string,
): InspectionPhoto[] {
  return photos.filter((photo) => photoMatchesCategory(photo.category, categoryKey));
}

function resolveGuide(category: PhotoCategoryDefinition) {
  return category.technicalGuide ?? category.visualGuide!;
}

function resolveSlotStatus(displayPhoto: InspectionPhoto | undefined): PhotoGuideCardStatus {
  if (!displayPhoto) return "pending";
  if (isPendingPhoto(displayPhoto)) return "uploading";
  return "captured";
}

function resolveDisplayPhoto(categoryPhotos: InspectionPhoto[]): InspectionPhoto | undefined {
  const confirmed = categoryPhotos.filter((p) => !isPendingPhoto(p));
  const pending = categoryPhotos.filter((p) => isPendingPhoto(p));
  return confirmed[confirmed.length - 1] ?? pending[pending.length - 1];
}

function resolveSectionGuidance(sectionKey: string, catalogGuidance?: string): string | undefined {
  return SECTION_UI_GUIDANCE[sectionKey] ?? catalogGuidance;
}

function isSectionUiComplete(
  section: PhotoSectionDefinition,
  photos: InspectionPhoto[],
  context: ReturnType<typeof usePhotoCaptureFlow>["captureContext"],
): boolean {
  if (section.key === "AVARIAS" || section.key === "FOTOS_EXTRAS") return false;

  const categories = getVisibleSectionCategories(section, context).filter(
    (category) => category.type === "SINGLE",
  );
  if (categories.length === 0) return false;

  return categories.every((category) => isPhotoCategoryComplete(photos, category.key));
}

export function PhotoSlotGrid({
  photos,
  inspection,
  onUpload,
  onDelete,
  onPickError,
}: PhotoSlotGridProps) {
  const [preview, setPreview] = useState<PhotoPreviewState | null>(null);
  const [photoAction, setPhotoAction] = useState<PhotoActionState | null>(null);

  const {
    captureContext,
    captureProgress,
    visibleSections,
    recommendedCategoryKey,
    isSectionOpen,
    setSectionOpen,
  } = usePhotoCaptureFlow({ photos, inspection });

  const captureStats = useMemo(
    () => computePhotoCaptureStats(photos, captureContext),
    [photos, captureContext],
  );

  const avariaCategory = useMemo(
    () =>
      visibleSections
        .flatMap((section) => section.categories)
        .find((category) => category.key === AVARIA_CATEGORY_KEY) ??
      visibleSections
        .flatMap((section) => section.subsections?.flatMap((s) => s.categories) ?? [])
        .find((category) => category.key === AVARIA_CATEGORY_KEY),
    [visibleSections],
  );

  const damagePhotos = useMemo(
    () => getPhotosForCategory(photos, AVARIA_CATEGORY_KEY),
    [photos],
  );

  const uploadFiles = (
    result: { files: File[]; rejectedCount: number },
    categoryKey: string,
    metadata?: Partial<PhotoCaptureMetadata>,
  ) => {
    if (result.rejectedCount > 0) {
      onPickError?.("Formato de arquivo não suportado. Use JPEG, PNG ou WebP.");
    }
    if (result.files.length === 0) return;
    result.files.forEach((file) => onUpload(file, categoryKey, metadata));
  };

  const buildPaintTestMetadata = (
    categoryKey: string,
    method: PaintTestMethod,
  ): Partial<PhotoCaptureMetadata> => ({
    sectionKey: "QUADROS_PORTAS",
    subcategory: "QDP_TESTE_PINTURA",
    displayName: buildPaintTestDisplayName(categoryKey, method),
    complementaryCategory: method,
  });

  const openPhotoActions = (
    category: PhotoCategoryDefinition,
    options?: { multiple?: boolean; damageIndex?: number },
  ) => {
    const categoryPhotos = getPhotosForCategory(photos, category.key);
    const confirmedCount = categoryPhotos.filter((photo) => !isPendingPhoto(photo)).length;
    const isDamage = category.type === "DAMAGE";

    setPhotoAction({
      categoryKey: category.key,
      categoryName: category.name,
      multiple: isDamage ? false : (options?.multiple ?? false),
      isPaintTest: isQuadrosPortasTestCategory(category.key),
      isDamage,
      damageIndex: isDamage ? (options?.damageIndex ?? confirmedCount + 1) : undefined,
    });
  };

  const openDamageRegistration = () => {
    if (!avariaCategory) return;
    openPhotoActions(avariaCategory);
  };

  const handleTakePhoto = async () => {
    const action = photoAction;
    if (!action || action.isPaintTest || action.isDamage) return;
    const result = await pickImageFiles({ capture: true, multiple: action.multiple });
    uploadFiles(result, action.categoryKey);
  };

  const handlePickGallery = async () => {
    const action = photoAction;
    if (!action || action.isPaintTest || action.isDamage) return;
    const result = await pickImageFiles({ multiple: action.multiple });
    uploadFiles(result, action.categoryKey);
  };

  const handleDamageTakePhoto = async (form: DamageCaptureForm) => {
    const action = photoAction;
    if (!action) return;
    const result = await pickImageFiles({ capture: true, multiple: false });
    uploadFiles(
      result,
      action.categoryKey,
      buildDamageCaptureMetadata(form, action.damageIndex),
    );
  };

  const handleDamagePickGallery = async (form: DamageCaptureForm) => {
    const action = photoAction;
    if (!action) return;
    const result = await pickImageFiles({ multiple: false });
    uploadFiles(
      result,
      action.categoryKey,
      buildDamageCaptureMetadata(form, action.damageIndex),
    );
  };

  const handlePaintTestTakePhoto = async (method: PaintTestMethod) => {
    const action = photoAction;
    if (!action) return;
    const result = await pickImageFiles({ capture: true, multiple: false });
    uploadFiles(result, action.categoryKey, buildPaintTestMetadata(action.categoryKey, method));
  };

  const handlePaintTestPickGallery = async (method: PaintTestMethod) => {
    const action = photoAction;
    if (!action) return;
    const result = await pickImageFiles({ multiple: false });
    uploadFiles(result, action.categoryKey, buildPaintTestMetadata(action.categoryKey, method));
  };

  const handleRetakeFromPreview = async () => {
    if (!preview || !onDelete) return;
    onDelete(preview.photo);
    setPreview(null);
    if (isDamageCategory(preview.category.key)) {
      openDamageRegistration();
    } else {
      openPhotoActions(preview.category);
    }
  };

  const renderCategorySlot = (category: PhotoCategoryDefinition) => {
    if (category.type === "DAMAGE") return null;

    const categoryPhotos = getPhotosForCategory(photos, category.key);
    const displayPhoto = resolveDisplayPhoto(categoryPhotos);
    const guide = resolveGuide(category);
    const isRecommended = recommendedCategoryKey === category.key;

    const slotWrapper = (content: ReactNode) => (
      <div key={category.key} id={getCategorySlotId(category.key)} className="scroll-mt-28">
        {content}
      </div>
    );

    if (category.type === "COMPLEMENTARY" || category.type === "MULTI") {
      return slotWrapper(
        <PhotoGuideCard
          categoryName={category.name}
          guide={guide}
          status={resolveSlotStatus(displayPhoto)}
          imageUrl={displayPhoto?.thumbnail_url || displayPhoto?.public_url}
          isRecommended={isRecommended}
          onCapture={() => openPhotoActions(category, { multiple: true })}
          onView={() =>
            displayPhoto?.public_url &&
            setPreview({ url: displayPhoto.public_url, category, photo: displayPhoto })
          }
        />,
      );
    }

    const isPaintTest = isQuadrosPortasTestCategory(category.key);
    const testSlotIndex = isPaintTest
      ? QDP_TESTE_PINTURA_CATEGORY_KEYS.findIndex((key) =>
          photoMatchesCategory(category.key, key),
        )
      : -1;
    const testIndexBadge = testSlotIndex >= 0 ? testSlotIndex + 1 : undefined;

    return slotWrapper(
      <PhotoGuideCard
        categoryName={category.name}
        guide={guide}
        status={resolveSlotStatus(displayPhoto)}
        imageUrl={displayPhoto?.thumbnail_url || displayPhoto?.public_url}
        indexBadge={testIndexBadge}
        isRecommended={isRecommended}
        onCapture={() => openPhotoActions(category)}
        onView={() =>
          displayPhoto?.public_url &&
          setPreview({ url: displayPhoto.public_url, category, photo: displayPhoto })
        }
      />,
    );
  };

  const renderSectionCategories = (sectionKey: string) => {
    const section = visibleSections.find((item) => item.key === sectionKey);
    if (!section) return null;

    if (sectionKey === "AVARIAS") {
      return (
        <PhotoDamageGallery
          photos={damagePhotos}
          onAdd={openDamageRegistration}
          onView={(photo) => {
            if (!avariaCategory || !photo.public_url) return;
            setPreview({ url: photo.public_url, category: avariaCategory, photo });
          }}
        />
      );
    }

    if (sectionKey === "FOTOS_EXTRAS") {
      const subsections = getVisibleSubsections(section, captureContext);
      const flatCategories = subsections.flatMap((subsection) => subsection.categories);
      const groups = groupFotosExtrasCategories(flatCategories, captureContext.isArmored);

      return (
        <div className="space-y-4">
          {groups.map(({ group, categories }) =>
            categories.length > 0 ? (
              <PhotoSubsectionPanel key={group.key} title={group.title}>
                <div className={PHOTO_SLOT_GRID_CLASS}>
                  {categories.map((category) => renderCategorySlot(category))}
                </div>
              </PhotoSubsectionPanel>
            ) : null,
          )}
        </div>
      );
    }

    const subsections = getVisibleSubsections(section, captureContext);
    if (subsections.length > 0) {
      return (
        <div className="space-y-4">
          {subsections.map((subsection) => (
            <PhotoSubsectionPanel key={subsection.key} title={subsection.name}>
              <div className={PHOTO_SLOT_GRID_CLASS}>
                {subsection.categories.map((category) => renderCategorySlot(category))}
              </div>
            </PhotoSubsectionPanel>
          ))}
        </div>
      );
    }

    return (
      <div className={PHOTO_SLOT_GRID_CLASS}>
        {section.categories.map((category) => renderCategorySlot(category))}
      </div>
    );
  };

  return (
    <div className="w-full space-y-3 sm:space-y-3.5">
      <PhotoCaptureProgressSummary stats={captureStats} />

      {visibleSections.map((section) => {
        const sectionProgress = captureProgress.sections.find((s) => s.sectionKey === section.key)!;
        const isComplete = isSectionUiComplete(section, photos, captureContext);
        const open = isSectionOpen(section.key);

        return (
          <PhotoSectionCard
            key={section.key}
            id={getSectionContainerId(section.key)}
            index={section.sortOrder}
            title={section.name}
            guidance={resolveSectionGuidance(section.key, section.guidance)}
            isComplete={isComplete}
            photoCount={sectionProgress.totalPhotos}
            open={open}
            onOpenChange={(nextOpen) => setSectionOpen(section.key, nextOpen)}
          >
            {open ? renderSectionCategories(section.key) : null}
          </PhotoSectionCard>
        );
      })}

      <PhotoActionSheet
        open={Boolean(photoAction && !photoAction.isPaintTest && !photoAction.isDamage)}
        onOpenChange={(open) => {
          if (!open) setPhotoAction(null);
        }}
        categoryName={photoAction?.categoryName}
        onTakePhoto={() => void handleTakePhoto()}
        onPickGallery={() => void handlePickGallery()}
      />

      <PhotoDamageCaptureSheet
        open={Boolean(photoAction?.isDamage)}
        onOpenChange={(open) => {
          if (!open) setPhotoAction(null);
        }}
        categoryName={photoAction?.categoryName}
        damageIndex={photoAction?.damageIndex}
        onTakePhoto={(form) => void handleDamageTakePhoto(form)}
        onPickGallery={(form) => void handleDamagePickGallery(form)}
      />

      <PhotoPaintTestActionSheet
        open={Boolean(photoAction?.isPaintTest)}
        onOpenChange={(open) => {
          if (!open) setPhotoAction(null);
        }}
        categoryName={photoAction?.categoryName}
        onTakePhoto={(method) => void handlePaintTestTakePhoto(method)}
        onPickGallery={(method) => void handlePaintTestPickGallery(method)}
      />

      {preview && (
        <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/85 p-4">
          <button
            type="button"
            className="absolute inset-0"
            aria-label="Fechar visualização"
            onClick={() => setPreview(null)}
          />
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 z-10 text-white hover:bg-white/20"
            aria-label="Fechar visualização"
            onClick={() => setPreview(null)}
          >
            <X className="size-5" aria-hidden />
          </Button>
          <figure className="relative z-10 flex max-h-[75vh] w-full max-w-lg flex-col items-center">
            <img
              src={preview.url}
              alt={preview.category.name}
              className="max-h-[65vh] w-full rounded-lg object-contain"
            />
            <figcaption className="mt-3 space-y-1 text-center text-sm text-white">
              <p className="font-semibold">
                {isDamageCategory(preview.category.key)
                  ? formatDamagePhotoSummary(preview.photo)
                  : preview.category.name}
              </p>
              {isDamageCategory(preview.category.key) && (
                <p className="text-xs text-white/80">
                  {formatDamagePhotoCaption(preview.photo) ?? "Sem metadados adicionais"}
                </p>
              )}
            </figcaption>
            {onDelete && (
              <Button
                type="button"
                variant="outline"
                className="mt-4 touch-target border-white/30 bg-white/10 text-white hover:bg-white/20"
                onClick={() => void handleRetakeFromPreview()}
              >
                <RotateCcw className="mr-2 size-4" />
                Remover
              </Button>
            )}
          </figure>
        </div>
      )}
    </div>
  );
}
