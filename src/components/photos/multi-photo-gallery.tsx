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
  onCapture: () => void;
  onViewPhoto?: (photo: InspectionPhoto) => void;
  onRetakePhoto?: (photo: InspectionPhoto) => void;
  resolvePhotoLabel?: (photo: InspectionPhoto, index: number) => string;
  className?: string;
}

export function MultiPhotoGallery({
  label,
  guide,
  photos,
  onCapture,
  onViewPhoto,
  resolvePhotoLabel,
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

  const latestIndex = latest ? sortedPhotos.findIndex((photo) => photo.id === latest.id) : -1;
  const latestLabel =
    latest && resolvePhotoLabel
      ? resolvePhotoLabel(latest, Math.max(latestIndex, 0))
      : label;

  const mainStatus: "uploading" | "captured" | "pending" = !latest
    ? "pending"
    : isPendingPhoto(latest)
      ? "uploading"
      : "captured";

  return (
    <>
      <PhotoGuideCard
        className={className}
        categoryName={latestLabel}
        guide={guide}
        status={mainStatus}
        imageUrl={latest?.thumbnail_url || latest?.public_url}
        onCapture={onCapture}
        onView={latest && onViewPhoto ? () => onViewPhoto(latest) : undefined}
      />

      {olderConfirmed.map((photo, index) => (
        <PhotoGuideCard
          key={photo.id}
          categoryName={resolvePhotoLabel?.(photo, index) ?? `${label} ${index + 1}`}
          guide={guide}
          status="captured"
          imageUrl={photo.thumbnail_url || photo.public_url}
          indexBadge={index + 1}
          onCapture={onCapture}
          onView={onViewPhoto ? () => onViewPhoto(photo) : undefined}
        />
      ))}

      {otherPending.map((photo, index) => (
        <PhotoGuideCard
          key={photo.id}
          categoryName={
            resolvePhotoLabel?.(photo, olderConfirmed.length + index) ??
            `${label} ${olderConfirmed.length + index + 1}`
          }
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
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn(PHOTO_SLOT_GRID_CLASS, className)}>{children}</div>;
}

export { PHOTO_SLOT_GRID_CLASS };
