import { Plus, CheckCircle2 } from "lucide-react";
import { formatDamagePhotoSummary } from "@/modules/torres-vistoria/domain/photos/avarias";
import { isPendingPhoto } from "@/modules/torres-vistoria/hooks/use-photos";
import type { InspectionPhoto } from "@/modules/torres-vistoria/services/photo-service";
import { cn } from "@/shared/lib/utils";

interface PhotoDamageGalleryProps {
  photos: InspectionPhoto[];
  onAdd: () => void;
  onView: (photo: InspectionPhoto) => void;
  onDelete?: (photo: InspectionPhoto) => void;
}

export function PhotoDamageGallery({
  photos,
  onAdd,
  onView,
}: PhotoDamageGalleryProps) {
  const sorted = [...photos].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );

  return (
    <div className="-mx-1 overflow-x-auto px-1 pb-1">
      <div className="flex min-w-min gap-2 sm:gap-2.5">
        <button
          type="button"
          onClick={onAdd}
          className="flex w-[7.5rem] shrink-0 flex-col overflow-hidden rounded-xl border-2 border-dashed border-orange-300/80 bg-orange-50/40 transition-all hover:border-orange-400 hover:bg-orange-50/70 active:scale-[0.98] sm:w-[8.5rem]"
        >
          <span className="flex aspect-[4/3] w-full items-center justify-center">
            <span className="flex flex-col items-center gap-1 text-orange-600">
              <Plus className="size-7 stroke-[2.5]" aria-hidden />
              <span className="px-1 text-center text-[10px] font-semibold leading-tight sm:text-[11px]">
                Registrar avaria
              </span>
            </span>
          </span>
        </button>

        {sorted.map((photo, index) => {
          const uploading = isPendingPhoto(photo);
          const label = formatDamagePhotoSummary(photo) || `Avaria ${index + 1}`;

          return (
            <button
              key={photo.id}
              type="button"
              onClick={() => !uploading && photo.public_url && onView(photo)}
              disabled={uploading}
              className={cn(
                "relative w-[7.5rem] shrink-0 overflow-hidden rounded-xl border bg-card text-left shadow-sm transition-all hover:shadow-md active:scale-[0.98] sm:w-[8.5rem]",
                uploading ? "border-border/60 opacity-70" : "border-border/80",
              )}
            >
              <span className="relative block aspect-[4/3] w-full bg-muted">
                {photo.thumbnail_url || photo.public_url ? (
                  <img
                    src={photo.thumbnail_url || photo.public_url || undefined}
                    alt={label}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <span className="flex h-full items-center justify-center text-[10px] text-muted-foreground">
                    Enviando…
                  </span>
                )}
                {!uploading && (
                  <span className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm">
                    <CheckCircle2 className="size-3" aria-hidden />
                  </span>
                )}
                {uploading && (
                  <span className="absolute inset-0 flex items-center justify-center bg-background/40">
                    <span className="size-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </span>
                )}
              </span>
              <span className="block border-t border-border/50 px-1.5 py-1.5">
                <span className="line-clamp-2 text-[10px] font-semibold leading-tight text-foreground sm:text-[11px]">
                  {label}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
