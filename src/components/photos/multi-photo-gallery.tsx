import type { ReactNode } from "react";
import type { InspectionPhoto } from "@/services/photo-service";
import { PhotoGuideCard } from "@/components/photos/photo-guide-card";
import { PHOTO_SLOT_GRID_CLASS } from "@/components/photos/photo-guide-card";
import { isPendingPhoto } from "@/hooks/use-photos";
import type { PhotoTechnicalGuide } from "@/lib/photos/types";
import { cn } from "@/lib/utils";

interface MultiPhotoGalleryProps {
  label: string;
  guide: PhotoTechnicalGuide;
  photos: InspectionPhoto[];
  required?: boolean;
  onCapture: () => void;
  onViewPhoto?: (photo: InspectionPhoto) => void;
  onRetakePhoto?: (photo: InspectionPhoto) => void;
  className?: string;
}

export function MultiPhotoGallery({
  label,
  guide,
  photos,
  required,
  onCapture,
  onViewPhoto,
  onRetakePhoto,
  className,
}: MultiPhotoGalleryProps) {
  const sortedPhotos = [...photos].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
  const confirmed = sortedPhotos.filter((photo) => !isPendingPhoto(photo));
  const pending = sortedPhotos.filter((photo) => isPendingPhoto(photo));
  const latest = confirmed[confirmed.length - 1] ?? pending[pending.length - 1];
  const extras = confirmed.slice(0, -1);
  const isUploading = pending.length > 0;

  const mainStatus = isUploading ? "uploading" : latest && !isPendingPhoto(latest) ? "captured" : "pending";

  return (
    <>
      <PhotoGuideCard
        className={className}
        categoryName={label}
        guide={guide}
        status={mainStatus}
        required={required}
        imageUrl={latest?.public_url}
        countBadge={confirmed.length > 1 ? confirmed.length : undefined}
        onCapture={onCapture}
        onView={latest && onViewPhoto ? () => onViewPhoto(latest) : undefined}
        onRetake={
          latest && onRetakePhoto
            ? () => onRetakePhoto(latest)
            : latest
              ? onCapture
              : undefined
        }
      />

      {extras.map((photo, index) => (
        <PhotoGuideCard
          key={photo.id}
          categoryName={`${label} ${index + 1}`}
          guide={guide}
          status={isPendingPhoto(photo) ? "uploading" : "captured"}
          imageUrl={photo.public_url}
          indexBadge={index + 1}
          onCapture={onCapture}
          onView={onViewPhoto ? () => onViewPhoto(photo) : undefined}
          onRetake={onRetakePhoto ? () => onRetakePhoto(photo) : undefined}
        />
      ))}
    </>
  );
}

export function MultiPhotoSectionGrid({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn(PHOTO_SLOT_GRID_CLASS, className)}>{children}</div>;
}

export { PHOTO_SLOT_GRID_CLASS };
