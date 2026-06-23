import type { InspectionPhoto } from "@/services/photo-service";

export function PhotoGallery({ photos }: { photos: InspectionPhoto[] }) {
  if (photos.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhuma foto enviada.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
      {photos.map((photo) => (
        <figure key={photo.id} className="overflow-hidden rounded-lg border border-border">
          {photo.public_url ? (
            <img
              src={photo.public_url}
              alt={photo.category}
              className="aspect-square w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="flex aspect-square items-center justify-center bg-muted text-xs">
              Sem preview
            </div>
          )}
          <figcaption className="truncate px-2 py-1 text-xs text-muted-foreground">
            {photo.category.replace(/_/g, " ")}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
