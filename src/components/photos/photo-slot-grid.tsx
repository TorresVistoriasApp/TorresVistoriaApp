import { useState, type ReactNode } from "react";
import { RotateCcw, X } from "lucide-react";
import { FormSectionCard } from "@/components/forms/form-section-card";
import { PhotoGuideCard, PHOTO_SLOT_GRID_CLASS } from "@/components/photos/photo-guide-card";
import { MultiPhotoGallery } from "@/components/photos/multi-photo-gallery";
import {
  PhotoCaptureProgressSummary,
  PhotoSectionProgressBar,
} from "@/components/photos/photo-section-progress";
import { PhotoSubsectionPanel } from "@/components/photos/photo-subsection-panel";
import { PhotoActionSheet } from "@/features/draft/components/photo-action-sheet";
import { Button } from "@/components/ui/button";
import { usePhotoCaptureFlow } from "@/hooks/use-photo-capture-flow";
import { isPendingPhoto } from "@/hooks/use-photos";
import { pickImageFiles } from "@/lib/pick-image-files";
import { type PhotoCategoryDefinition, getPhotoCategoryLabel, photoMatchesCategory } from "@/lib/photos/photo-catalog";
import type { PhotoCaptureInspectionContext } from "@/lib/photos/photo-capture-visibility";
import { getVisibleSubsections } from "@/lib/photos/photo-capture-visibility";
import {
  getCategorySlotId,
  getSectionContainerId,
} from "@/lib/photos/photo-capture-sequence";
import { isPhotoRequirementActive } from "@/lib/photos/photo-requirements-flag";
import type { PhotoGuideCardStatus, PhotoSectionProgress } from "@/lib/photos/types";
import type { InspectionPhoto } from "@/services/photo-service";

interface PhotoSlotGridProps {
  photos: InspectionPhoto[];
  inspection?: PhotoCaptureInspectionContext | null;
  onUpload: (file: File, category: string, metadata?: Record<string, string>) => void;
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
};

function getPhotosForCategory(
  photos: InspectionPhoto[],
  categoryKey: string,
): InspectionPhoto[] {
  return photos.filter((photo) => photoMatchesCategory(photo.category, categoryKey));
}

function isMultiCategory(category: PhotoCategoryDefinition): boolean {
  return category.type === "MULTI" || category.type === "DAMAGE" || category.type === "COMPLEMENTARY";
}

function buildSectionStatusLabel(progress: PhotoSectionProgress): string {
  if (progress.status === "COMPLETED") return "Concluído";
  if (progress.requiredPhotos === 0) {
    return progress.totalPhotos === 0
      ? "Nenhuma foto"
      : `${progress.totalPhotos} foto${progress.totalPhotos === 1 ? "" : "s"}`;
  }
  if (progress.remainingPhotos > 0) {
    return `${progress.completedPhotos}/${progress.requiredPhotos} · ${progress.remainingPhotos} restante${progress.remainingPhotos === 1 ? "" : "s"}`;
  }
  return `${progress.completedPhotos}/${progress.requiredPhotos}`;
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

  const confirmedPhotoCount = photos.filter((photo) => !isPendingPhoto(photo)).length;

  const uploadFiles = (result: { files: File[]; rejectedCount: number }, categoryKey: string) => {
    if (result.rejectedCount > 0) {
      onPickError?.("Formato de arquivo não suportado. Use JPEG, PNG ou WebP.");
    }
    if (result.files.length === 0) return;
    result.files.forEach((file) => onUpload(file, categoryKey));
  };

  const openPhotoActions = (category: PhotoCategoryDefinition, multiple = false) => {
    setPhotoAction({
      categoryKey: category.key,
      categoryName: category.name,
      multiple,
    });
  };

  const handleTakePhoto = async () => {
    const action = photoAction;
    if (!action) return;
    const result = await pickImageFiles({ capture: true, multiple: action.multiple });
    uploadFiles(result, action.categoryKey);
  };

  const handlePickGallery = async () => {
    const action = photoAction;
    if (!action) return;
    const result = await pickImageFiles({ multiple: action.multiple });
    uploadFiles(result, action.categoryKey);
  };

  const handleRetakeFromPreview = async () => {
    if (!preview || !onDelete) return;
    onDelete(preview.photo);
    setPreview(null);
    openPhotoActions(preview.category);
  };

  const renderCategorySlot = (category: PhotoCategoryDefinition) => {
    const categoryPhotos = getPhotosForCategory(photos, category.key);
    const confirmed = categoryPhotos.filter((p) => !isPendingPhoto(p));
    const displayPhoto = resolveDisplayPhoto(categoryPhotos);
    const guide = resolveGuide(category);
    const isRecommended = recommendedCategoryKey === category.key;

    const slotWrapper = (content: ReactNode) => (
      <div key={category.key} id={getCategorySlotId(category.key)} className="scroll-mt-28">
        {content}
      </div>
    );

    if (isMultiCategory(category)) {
      return slotWrapper(
        <MultiPhotoGallery
          label={category.name}
          guide={guide}
          photos={categoryPhotos}
          required={isPhotoRequirementActive(category.required)}
          onCapture={() => openPhotoActions(category, true)}
          onViewPhoto={(photo) =>
            photo.public_url && setPreview({ url: photo.public_url, category, photo })
          }
          onRetakePhoto={(photo) => {
            onDelete?.(photo);
            openPhotoActions(category, true);
          }}
        />,
      );
    }

    return slotWrapper(
      <PhotoGuideCard
        categoryName={category.name}
        guide={guide}
        status={resolveSlotStatus(displayPhoto)}
        required={isPhotoRequirementActive(category.required)}
        imageUrl={displayPhoto?.thumbnail_url || displayPhoto?.public_url}
        countBadge={confirmed.length > 1 ? confirmed.length : undefined}
        isRecommended={isRecommended}
        onCapture={() => openPhotoActions(category)}
        onView={() =>
          displayPhoto?.public_url &&
          setPreview({ url: displayPhoto.public_url, category, photo: displayPhoto })
        }
        onRetake={() => {
          const latestConfirmed = confirmed[confirmed.length - 1];
          if (latestConfirmed && onDelete) onDelete(latestConfirmed);
          openPhotoActions(category);
        }}
      />,
    );
  };

  const renderSectionCategories = (sectionKey: string) => {
    const section = visibleSections.find((item) => item.key === sectionKey);
    if (!section) return null;

    const subsections = getVisibleSubsections(section, captureContext);
    if (subsections.length > 0) {
      return (
        <div className="space-y-6">
          {subsections.map((subsection) => (
            <PhotoSubsectionPanel
              key={subsection.key}
              title={subsection.name}
              description={subsection.description}
              guidance={subsection.guidance}
            >
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
    <div className="w-full space-y-4 sm:space-y-5 lg:space-y-4">
      <PhotoCaptureProgressSummary
        percentComplete={captureProgress.percentComplete}
        totalCompleted={captureProgress.totalCompleted}
        totalRequired={captureProgress.totalRequired}
        estimatedSecondsRemaining={captureProgress.estimatedSecondsRemaining}
        totalPhotos={confirmedPhotoCount}
      />

      {recommendedCategoryKey && (
        <p className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-foreground">
          Próxima fotografia recomendada:{" "}
          <span className="font-semibold text-primary">
            {getPhotoCategoryLabel(recommendedCategoryKey)}
          </span>
        </p>
      )}

      {!captureProgress.canProceed && captureProgress.missingRequiredLabels.length <= 6 && (
        <p className="rounded-lg border border-amber-200/80 bg-amber-50/50 px-3 py-2 text-xs text-amber-900">
          Pendências: {captureProgress.missingRequiredLabels.slice(0, 6).join(", ")}
          {captureProgress.missingRequiredLabels.length > 6 &&
            ` e mais ${captureProgress.missingRequiredLabels.length - 6}...`}
        </p>
      )}

      {visibleSections.map((section) => {
        const sectionProgress = captureProgress.sections.find((s) => s.sectionKey === section.key)!;
        const visibleCategories = section.subsections?.length
          ? getVisibleSubsections(section, captureContext).flatMap((group) => group.categories)
          : section.categories;
        const isOptionalSection = visibleCategories.every(
          (c) => !isPhotoRequirementActive(c.required),
        );
        const SectionIcon = section.icon;

        return (
          <FormSectionCard
            key={section.key}
            id={getSectionContainerId(section.key)}
            index={section.sortOrder}
            title={section.name}
            description={section.description}
            statusLabel={buildSectionStatusLabel(sectionProgress)}
            optional={isOptionalSection}
            collapsible={section.collapsible ?? false}
            open={isSectionOpen(section.key)}
            onOpenChange={(open) => setSectionOpen(section.key, open)}
          >
            {section.guidance && (
              <p className="rounded-lg border border-sky-200/80 bg-sky-50/60 px-3 py-2 text-xs leading-relaxed text-sky-900">
                {section.guidance}
              </p>
            )}

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <SectionIcon className="size-4 shrink-0 text-primary" aria-hidden />
              <span>
                {sectionProgress.totalPhotos} foto{sectionProgress.totalPhotos === 1 ? "" : "s"}
                {sectionProgress.requiredPhotos > 0 &&
                  ` · ${sectionProgress.remainingPhotos} restante${sectionProgress.remainingPhotos === 1 ? "" : "s"}`}
              </span>
            </div>

            <PhotoSectionProgressBar
              progress={sectionProgress}
              sectionName={section.name}
              className="mb-3 sm:mb-4"
            />

            {renderSectionCategories(section.key)}
          </FormSectionCard>
        );
      })}

      <PhotoActionSheet
        open={Boolean(photoAction)}
        onOpenChange={(open) => {
          if (!open) setPhotoAction(null);
        }}
        categoryName={photoAction?.categoryName}
        onTakePhoto={() => void handleTakePhoto()}
        onPickGallery={() => void handlePickGallery()}
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
            onClick={() => setPreview(null)}
          >
            <X className="size-5" />
          </Button>
          <figure className="relative z-10 flex max-h-[75vh] w-full max-w-lg flex-col items-center">
            <img
              src={preview.url}
              alt={preview.category.name}
              className="max-h-[65vh] w-full rounded-lg object-contain"
            />
            <figcaption className="mt-3 text-center text-sm font-semibold text-white">
              {preview.category.name}
            </figcaption>
            {onDelete && (
              <Button
                type="button"
                variant="outline"
                className="mt-4 touch-target border-white/30 bg-white/10 text-white hover:bg-white/20"
                onClick={() => void handleRetakeFromPreview()}
              >
                <RotateCcw className="mr-2 size-4" />
                Refazer fotografia
              </Button>
            )}
          </figure>
        </div>
      )}
    </div>
  );
}
