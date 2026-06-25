import type { LucideIcon } from "lucide-react";
import type { InspectionPhoto } from "@/services/photo-service";
import { PhotoSlotFrame } from "@/components/photos/photo-slot-frame";
import { isPendingPhoto } from "@/hooks/use-photos";

interface MultiPhotoGalleryProps {
  label: string;
  hint: string;
  icon: LucideIcon;
  photos: InspectionPhoto[];
  onAdd: () => void;
}

export function MultiPhotoGallery({
  label,
  hint,
  icon,
  photos,
  onAdd,
}: MultiPhotoGalleryProps) {
  const sortedPhotos = [...photos].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
  const confirmedCount = sortedPhotos.filter((photo) => !isPendingPhoto(photo)).length;

  return (
    <div className="space-y-3">
      {confirmedCount > 0 ? (
        <p className="text-xs leading-relaxed text-muted-foreground">
          {confirmedCount} foto{confirmedCount === 1 ? "" : "s"} adicionada
          {confirmedCount === 1 ? "" : "s"}. Role para conferir cada uma antes de continuar.
        </p>
      ) : (
        <p className="text-xs leading-relaxed text-muted-foreground">{hint}</p>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4">
        {sortedPhotos.map((photo, index) => (
          <PhotoSlotFrame
            key={photo.id}
            label={`${label} ${index + 1}`}
            hint="Confira se a imagem corresponde ao veículo vistoriado"
            icon={icon}
            imageUrl={photo.public_url}
            indexBadge={index + 1}
            isUploading={isPendingPhoto(photo)}
          />
        ))}

        <PhotoSlotFrame label={label} hint={hint} icon={icon} onClick={onAdd} />
      </div>
    </div>
  );
}
