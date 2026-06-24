import type { InspectionPhoto } from "@/services/photo-service";
import { PhotoPreview } from "@/components/photos/photo-preview";

export function PhotoGallery({ photos }: { photos: InspectionPhoto[] }) {
  if (photos.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhuma foto enviada.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      {photos.map((photo) => (
        <figure key={photo.id}>
          {photo.public_url ? (
            <PhotoPreview url={photo.public_url} category={photo.category} />
          ) : (
            <div className="flex aspect-square items-center justify-center rounded-lg border border-border bg-muted text-xs">
              Sem preview
            </div>
          )}
          <figcaption className="truncate px-1 py-1 text-xs text-muted-foreground">
            {photo.category.replace(/_/g, " ")}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
