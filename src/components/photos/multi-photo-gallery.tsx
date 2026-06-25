import type { LucideIcon } from "lucide-react";
import type { InspectionPhoto } from "@/services/photo-service";
import { PhotoSlotFrame, photoSlotScrollWidthClass } from "@/components/photos/photo-slot-frame";

interface MultiPhotoGalleryProps {
  label: string;
  hint: string;
  icon: LucideIcon;
  photos: InspectionPhoto[];
  uploading?: boolean;
  disabled?: boolean;
  onAdd: () => void;
}

export function MultiPhotoGallery({
  label,
  hint,
  icon,
  photos,
  uploading,
  disabled,
  onAdd,
}: MultiPhotoGalleryProps) {
  const sortedPhotos = [...photos].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );

  return (
    <div className="space-y-3">
      {sortedPhotos.length > 0 && (
        <p className="text-xs leading-relaxed text-muted-foreground">
          {sortedPhotos.length} foto{sortedPhotos.length === 1 ? "" : "s"} adicionada
          {sortedPhotos.length === 1 ? "" : "s"}. Toque em{" "}
          <span className="font-medium text-foreground">Adicionar</span> para incluir mais.
        </p>
      )}

      <div className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <PhotoSlotFrame
          label={label}
          hint={hint}
          icon={icon}
          isUploading={uploading}
          disabled={disabled}
          onClick={onAdd}
          className={photoSlotScrollWidthClass}
        />

        {sortedPhotos.map((photo, index) => (
          <PhotoSlotFrame
            key={photo.id}
            label={`${label} ${index + 1}`}
            hint={hint}
            icon={icon}
            imageUrl={photo.public_url}
            indexBadge={index + 1}
            className={photoSlotScrollWidthClass}
          />
        ))}
      </div>
    </div>
  );
}
