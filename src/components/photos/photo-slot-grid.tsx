import { useMemo, useState } from "react";
import { RotateCcw, X } from "lucide-react";
import { FormSectionCard } from "@/components/forms/form-section-card";
import { PhotoGuideCard, PHOTO_SLOT_GRID_CLASS } from "@/components/photos/photo-guide-card";
import { MultiPhotoGallery } from "@/components/photos/multi-photo-gallery";
import {
  PhotoCaptureProgressSummary,
  PhotoSectionProgressBar,
} from "@/components/photos/photo-section-progress";
import { PhotoActionSheet } from "@/features/draft/components/photo-action-sheet";
import { Button } from "@/components/ui/button";
import { isPendingPhoto } from "@/hooks/use-photos";
import { isSupportedImageFile } from "@/lib/compress-image";
import {
  PHOTO_CATALOG,
  type PhotoCategoryDefinition,
  photoMatchesCategory,
} from "@/lib/photos/photo-catalog";
import { computeCaptureProgress, computeSectionProgress } from "@/lib/photos/photo-progress";
import type { PhotoGuideCardStatus } from "@/lib/photos/types";
import type { InspectionPhoto } from "@/services/photo-service";

interface PhotoSlotGridProps {
  photos: InspectionPhoto[];
  onUpload: (file: File, category: string, metadata?: Record<string, string>) => void;
  onDelete?: (photo: InspectionPhoto) => void;
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

function buildSectionStatusLabel(sectionKey: string, photos: InspectionPhoto[]): string {
  const progress = computeSectionProgress(sectionKey, photos);
  if (progress.status === "COMPLETED") return "Concluído";
  if (progress.requiredPhotos === 0) {
    return progress.totalPhotos === 0
      ? "Nenhuma foto"
      : `${progress.totalPhotos} foto${progress.totalPhotos === 1 ? "" : "s"}`;
  }
  return `${progress.completedPhotos}/${progress.requiredPhotos}`;
}

function resolveGuide(category: PhotoCategoryDefinition) {
  return category.technicalGuide ?? category.visualGuide!;
}

function resolveSlotStatus(
  categoryPhotos: InspectionPhoto[],
  confirmed: InspectionPhoto[],
): PhotoGuideCardStatus {
  const hasPending = categoryPhotos.some((p) => isPendingPhoto(p));
  if (hasPending) return "uploading";
  if (confirmed.length > 0) return "captured";
  return "pending";
}

function resolveDisplayPhoto(categoryPhotos: InspectionPhoto[]): InspectionPhoto | undefined {
  const confirmed = categoryPhotos.filter((p) => !isPendingPhoto(p));
  const pending = categoryPhotos.filter((p) => isPendingPhoto(p));
  return confirmed[confirmed.length - 1] ?? pending[pending.length - 1];
}

function pickFiles(options: { capture?: boolean; multiple?: boolean }): Promise<File[]> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/jpeg,image/png,image/webp,image/gif,image/bmp,image/heic,image/heif,.heic,.heif";
    if (options.capture) {
      input.capture = "environment";
    }
    input.multiple = Boolean(options.multiple);

    let settled = false;
    const finish = (files: File[]) => {
      if (settled) return;
      settled = true;
      input.remove();
      resolve(files.filter(isSupportedImageFile));
    };

    input.onchange = () => finish(Array.from(input.files ?? []));

    const inputWithCancel = input as HTMLInputElement & { oncancel?: (() => void) | null };
    if ("oncancel" in inputWithCancel) {
      inputWithCancel.oncancel = () => finish([]);
    } else {
      const onWindowFocus = () => {
        window.setTimeout(() => {
          if (!input.files?.length) finish([]);
        }, 400);
      };
      window.addEventListener("focus", onWindowFocus, { once: true });
    }

    input.click();
  });
}

export function PhotoSlotGrid({ photos, onUpload, onDelete }: PhotoSlotGridProps) {
  const [preview, setPreview] = useState<PhotoPreviewState | null>(null);
  const [photoAction, setPhotoAction] = useState<PhotoActionState | null>(null);

  const captureProgress = useMemo(() => computeCaptureProgress(photos), [photos]);
  const confirmedPhotoCount = photos.filter((photo) => !isPendingPhoto(photo)).length;

  const uploadFiles = (files: File[], categoryKey: string) => {
    if (files.length === 0) return;
    files.forEach((file) => onUpload(file, categoryKey));
  };

  const openPhotoActions = (category: PhotoCategoryDefinition, multiple = false) => {
    setPhotoAction({
      categoryKey: category.key,
      categoryName: category.name,
      multiple,
    });
  };

  const handleTakePhoto = async () => {
    if (!photoAction) return;
    const files = await pickFiles({ capture: true, multiple: photoAction.multiple });
    uploadFiles(files, photoAction.categoryKey);
  };

  const handlePickGallery = async () => {
    if (!photoAction) return;
    const files = await pickFiles({ multiple: photoAction.multiple });
    uploadFiles(files, photoAction.categoryKey);
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

    if (isMultiCategory(category)) {
      return (
        <MultiPhotoGallery
          key={category.key}
          label={category.name}
          guide={guide}
          photos={categoryPhotos}
          required={category.required}
          onCapture={() => openPhotoActions(category, true)}
          onViewPhoto={(photo) =>
            photo.public_url && setPreview({ url: photo.public_url, category, photo })
          }
          onRetakePhoto={(photo) => {
            onDelete?.(photo);
            openPhotoActions(category, true);
          }}
        />
      );
    }

    return (
      <PhotoGuideCard
        key={category.key}
        categoryName={category.name}
        guide={guide}
        status={resolveSlotStatus(categoryPhotos, confirmed)}
        required={category.required}
        imageUrl={displayPhoto?.public_url}
        countBadge={confirmed.length > 1 ? confirmed.length : undefined}
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
      />
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

      {!captureProgress.canProceed && captureProgress.missingRequiredLabels.length <= 6 && (
        <p className="rounded-lg border border-amber-200/80 bg-amber-50/50 px-3 py-2 text-xs text-amber-900">
          Pendências: {captureProgress.missingRequiredLabels.slice(0, 6).join(", ")}
          {captureProgress.missingRequiredLabels.length > 6 &&
            ` e mais ${captureProgress.missingRequiredLabels.length - 6}...`}
        </p>
      )}

      {PHOTO_CATALOG.map((section) => {
        const sectionProgress = captureProgress.sections.find((s) => s.sectionKey === section.key)!;
        const isOptionalSection = section.categories.every((c) => !c.required);

        return (
          <FormSectionCard
            key={section.key}
            id={`fotos-${section.key.toLowerCase()}`}
            index={section.sortOrder}
            title={section.name}
            description={section.description}
            statusLabel={buildSectionStatusLabel(section.key, photos)}
            optional={isOptionalSection}
            collapsible={section.collapsible ?? false}
            defaultOpen={section.defaultOpen ?? true}
          >
            <PhotoSectionProgressBar
              progress={sectionProgress}
              sectionName={section.name}
              className="mb-3 sm:mb-4"
            />

            <div className={PHOTO_SLOT_GRID_CLASS}>
              {section.categories.map((category) => renderCategorySlot(category))}
            </div>
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

export { computeCaptureProgress };
