import type { InspectionPhoto } from "@/modules/torres-vistoria/services/photo-service";
import { PhotoPreview } from "@/modules/torres-vistoria/components/photos/photo-preview";

function gridUrl(photo: InspectionPhoto) {
  return photo.thumbnail_url || photo.public_url;
}

export function PhotoGallery({ photos }: { photos: InspectionPhoto[] }) {
  if (photos.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhuma foto enviada.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      {photos.map((photo) => {
        const url = gridUrl(photo);
        return (
        <figure key={photo.id}>
          {url ? (
            <PhotoPreview url={url} category={photo.category} />
          ) : (
            <div className="flex aspect-square items-center justify-center rounded-lg border border-border bg-muted text-xs">
              Sem preview
            </div>
          )}
          <figcaption className="truncate px-1 py-1 text-xs text-muted-foreground">
            {photo.category.replace(/_/g, " ")}
          </figcaption>
        </figure>
        );
      })}
    </div>
  );
}
