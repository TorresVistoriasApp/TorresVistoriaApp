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
  resolvePhotoLabel?: (photo: InspectionPhoto, index: number) => string;
  resolvePhotoSubtitle?: (photo: InspectionPhoto) => string | null;
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
  resolvePhotoLabel,
  resolvePhotoSubtitle,
  className,
}: MultiPhotoGalleryProps) {
  const sortedPhotos = [...photos].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
  const confirmed = sortedPhotos.filter((photo) => !isPendingPhoto(photo));
  const pending = sortedPhotos.filter((photo) => isPendingPhoto(photo));
  const latest = confirmed[confirmed.length - 1] ?? pending[pending.length - 1];
  const olderConfirmed = confirmed.slice(0, -1);
  const otherPending = pending.filter((photo) => photo.id !== latest?.id);

  const mainStatus: "uploading" | "captured" | "pending" = !latest
    ? "pending"
    : isPendingPhoto(latest)
      ? "uploading"
      : "captured";

  const latestIndex = latest ? sortedPhotos.findIndex((photo) => photo.id === latest.id) : -1;
  const latestLabel =
    latest && resolvePhotoLabel
      ? resolvePhotoLabel(latest, Math.max(latestIndex, 0))
      : label;
  const latestSubtitle = latest && resolvePhotoSubtitle ? resolvePhotoSubtitle(latest) : null;

  return (
    <>
      <PhotoGuideCard
        className={className}
        categoryName={latestLabel}
        subtitle={latestSubtitle ?? undefined}
        guide={guide}
        status={mainStatus}
        required={required}
        imageUrl={latest?.thumbnail_url || latest?.public_url}
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

      {olderConfirmed.map((photo, index) => (
        <PhotoGuideCard
          key={photo.id}
          categoryName={resolvePhotoLabel?.(photo, index) ?? `${label} ${index + 1}`}
          subtitle={resolvePhotoSubtitle?.(photo) ?? undefined}
          guide={guide}
          status="captured"
          imageUrl={photo.thumbnail_url || photo.public_url}
          indexBadge={index + 1}
          onCapture={onCapture}
          onView={onViewPhoto ? () => onViewPhoto(photo) : undefined}
          onRetake={onRetakePhoto ? () => onRetakePhoto(photo) : undefined}
        />
      ))}

      {otherPending.map((photo, index) => (
        <PhotoGuideCard
          key={photo.id}
          categoryName={
            resolvePhotoLabel?.(photo, olderConfirmed.length + index) ??
            `${label} ${olderConfirmed.length + index + 1}`
          }
          subtitle={resolvePhotoSubtitle?.(photo) ?? undefined}
          guide={guide}
          status="uploading"
          imageUrl={photo.thumbnail_url || photo.public_url}
          indexBadge={olderConfirmed.length + index + 1}
          onCapture={onCapture}
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
