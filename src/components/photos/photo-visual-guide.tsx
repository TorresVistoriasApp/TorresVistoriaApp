import type { PhotoVisualGuide } from "@/lib/photos/types";
import { VehicleWireframe } from "@/components/photos/vehicle-wireframe";
import { cn } from "@/lib/utils";

interface PhotoVisualGuideProps {
  guide: PhotoVisualGuide;
  categoryName: string;
  captured?: boolean;
  imageUrl?: string | null;
  className?: string;
}

export function PhotoVisualGuidePanel({
  guide,
  categoryName,
  captured,
  imageUrl,
  className,
}: PhotoVisualGuideProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="relative overflow-hidden rounded-xl border border-border bg-muted/30">
        <div className="aspect-[5/4] w-full">
          {captured && imageUrl ? (
            <img src={imageUrl} alt={categoryName} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full flex-col items-center justify-center p-4">
              <div className="h-32 w-full max-w-[220px] sm:h-36">
                <VehicleWireframe
                  view={guide.view}
                  highlight={guide.highlight}
                  arrowAngle={guide.arrowAngle}
                />
              </div>
            </div>
          )}
        </div>
        {captured && (
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2">
            <p className="text-xs font-semibold text-white">Captura concluída</p>
          </div>
        )}
      </div>

      {!captured && (
        <p className="text-sm leading-relaxed text-muted-foreground">{guide.instruction}</p>
      )}

      {guide.exampleImageUrl && !captured && (
        <div className="rounded-lg border border-dashed border-border p-2">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
            Exemplo de enquadramento
          </p>
          <img
            src={guide.exampleImageUrl}
            alt={`Exemplo — ${categoryName}`}
            className="aspect-video w-full rounded-md object-cover"
          />
        </div>
      )}
    </div>
  );
}
