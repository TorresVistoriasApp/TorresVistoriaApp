import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import type { InspectionPhoto } from "@/services/photo-service";
import { PhotoSlotFrame, PHOTO_SLOT_GRID_CLASS } from "@/components/photos/photo-slot-frame";
import { isPendingPhoto } from "@/hooks/use-photos";
import type { PhotoVisualGuide } from "@/lib/photos/types";
import { cn } from "@/lib/utils";

interface MultiPhotoGalleryProps {
  label: string;
  hint: string;
  icon: LucideIcon;
  visualGuide?: PhotoVisualGuide;
  photos: InspectionPhoto[];
  required?: boolean;
  onAdd: () => void;
  onPhotoClick?: (photo: InspectionPhoto) => void;
  className?: string;
}

/**
 * Slot compacto para categorias multi-foto — ocupa uma célula do grid
 * e expande miniaturas extras na mesma grade quando necessário.
 */
export function MultiPhotoGallery({
  label,
  hint,
  icon,
  visualGuide,
  photos,
  required,
  onAdd,
  onPhotoClick,
  className,
}: MultiPhotoGalleryProps) {
  const sortedPhotos = [...photos].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
  const confirmed = sortedPhotos.filter((photo) => !isPendingPhoto(photo));
  const latest = confirmed[confirmed.length - 1];
  const extras = confirmed.slice(0, -1);

  return (
    <>
      <PhotoSlotFrame
        className={className}
        label={label}
        hint={hint}
        icon={icon}
        visualGuide={visualGuide}
        imageUrl={latest?.public_url}
        countBadge={confirmed.length > 1 ? confirmed.length : undefined}
        required={required}
        isUploading={sortedPhotos.some((photo) => isPendingPhoto(photo))}
        onClick={onAdd}
      />

      {extras.map((photo, index) => (
        <PhotoSlotFrame
          key={photo.id}
          label={`${label} ${index + 1}`}
          hint={hint}
          icon={icon}
          imageUrl={photo.public_url}
          indexBadge={index + 1}
          isUploading={isPendingPhoto(photo)}
          onClick={onPhotoClick ? () => onPhotoClick(photo) : undefined}
        />
      ))}
    </>
  );
}

/** Grade interna para seções 100% multi — mantém 2 colunas no mobile. */
export function MultiPhotoSectionGrid({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn(PHOTO_SLOT_GRID_CLASS, className)}>{children}</div>;
}
