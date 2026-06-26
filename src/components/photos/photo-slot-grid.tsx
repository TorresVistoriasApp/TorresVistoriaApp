import { useMemo, useState } from "react";
import { RotateCcw, X } from "lucide-react";
import { FormSectionCard } from "@/components/forms/form-section-card";
import { PhotoSlotFrame, PHOTO_SLOT_GRID_CLASS } from "@/components/photos/photo-slot-frame";
import { MultiPhotoGallery } from "@/components/photos/multi-photo-gallery";
import {
  PhotoCaptureProgressSummary,
  PhotoSectionProgressBar,
} from "@/components/photos/photo-section-progress";
import { Button } from "@/components/ui/button";
import { isPendingPhoto } from "@/hooks/use-photos";
import {
  PHOTO_CATALOG,
  type PhotoCategoryDefinition,
  photoMatchesCategory,
} from "@/lib/photos/photo-catalog";
import { computeCaptureProgress, computeSectionProgress } from "@/lib/photos/photo-progress";
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

export function PhotoSlotGrid({ photos, onUpload, onDelete }: PhotoSlotGridProps) {
  const [preview, setPreview] = useState<PhotoPreviewState | null>(null);

  const captureProgress = useMemo(() => computeCaptureProgress(photos), [photos]);
  const confirmedPhotoCount = photos.filter((photo) => !isPendingPhoto(photo)).length;

  const openFilePicker = (categoryKey: string, multiple = false) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.capture = "environment";
    input.multiple = multiple;
    input.onchange = () => {
      Array.from(input.files ?? []).forEach((file) => onUpload(file, categoryKey));
    };
    input.click();
  };

  const handleCategoryClick = (category: PhotoCategoryDefinition) => {
    const categoryPhotos = getPhotosForCategory(photos, category.key);
    const confirmed = categoryPhotos.filter((p) => !isPendingPhoto(p));

    if (isMultiCategory(category)) {
      openFilePicker(category.key, true);
      return;
    }

    const latest = confirmed[confirmed.length - 1];
    if (latest?.public_url) {
      setPreview({ url: latest.public_url, category, photo: latest });
      return;
    }

    openFilePicker(category.key);
  };

  const handleRetake = () => {
    if (!preview || !onDelete) return;
    onDelete(preview.photo);
    setPreview(null);
    openFilePicker(preview.category.key);
  };

  const renderCategorySlot = (category: PhotoCategoryDefinition) => {
    const categoryPhotos = getPhotosForCategory(photos, category.key);
    const latestPhoto = categoryPhotos[categoryPhotos.length - 1];
    const isUploading = categoryPhotos.some((p) => isPendingPhoto(p));
    const confirmed = categoryPhotos.filter((p) => !isPendingPhoto(p));

    if (isMultiCategory(category)) {
      return (
        <MultiPhotoGallery
          key={category.key}
          label={category.name}
          hint={category.description}
          icon={category.icon}
          visualGuide={category.visualGuide}
          photos={categoryPhotos}
          required={category.required}
          onAdd={() => handleCategoryClick(category)}
          onPhotoClick={(photo) =>
            photo.public_url &&
            setPreview({ url: photo.public_url, category, photo })
          }
        />
      );
    }

    return (
      <PhotoSlotFrame
        key={category.key}
        label={category.name}
        hint={category.description}
        icon={category.icon}
        visualGuide={category.visualGuide}
        imageUrl={latestPhoto?.public_url}
        countBadge={confirmed.length > 1 ? confirmed.length : undefined}
        isUploading={isUploading}
        required={category.required}
        onClick={() => handleCategoryClick(category)}
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
        const isFirstSection = section.sortOrder === 1;

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

            {isFirstSection && section.categories.every(isMultiCategory) && (
              <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground sm:text-xs">
                Toque em cada card para anexar documentos. A ilustração indica o tipo de registro esperado.
              </p>
            )}
          </FormSectionCard>
        );
      })}

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
                onClick={handleRetake}
              >
                <RotateCcw className="mr-2 size-4" />
                Refazer foto
              </Button>
            )}
          </figure>
        </div>
      )}
    </div>
  );
}

export { computeCaptureProgress };
