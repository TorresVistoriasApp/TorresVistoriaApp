import { TechnicalWireframe } from "@/components/photos/technical-wireframe";
import { CameraAngleIndicator } from "@/components/photos/camera-angle-indicator";
import { PhotoExamplePlaceholder } from "@/components/photos/photo-example-placeholder";
import type { PhotoTechnicalGuide } from "@/lib/photos/types";
import { GUIDE_COLORS } from "@/lib/photos/guide-tokens";
import { cn } from "@/lib/utils";

interface PhotoVisualGuidePanelProps {
  guide: PhotoTechnicalGuide;
  categoryName: string;
  captured?: boolean;
  imageUrl?: string | null;
  className?: string;
}

/** Painel expandido do guia — usado em modais ou telas dedicadas. */
export function PhotoVisualGuidePanel({
  guide,
  categoryName,
  captured,
  imageUrl,
  className,
}: PhotoVisualGuidePanelProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <div
        className="overflow-hidden rounded-xl border border-slate-200"
        style={{ backgroundColor: GUIDE_COLORS.surfaceMuted }}
      >
        {captured && imageUrl ? (
          <img src={imageUrl} alt={categoryName} className="aspect-[4/3] w-full object-cover" />
        ) : (
          <div className="space-y-3 p-4">
            <div className="grid grid-cols-[1fr_auto] gap-3">
              <div className="aspect-[4/3] overflow-hidden rounded border border-slate-200 bg-white p-2">
                <TechnicalWireframe
                  view={guide.view}
                  highlight={guide.highlight}
                  highlightLabel={guide.highlightLabel}
                />
              </div>
              <CameraAngleIndicator camera={guide.camera} />
            </div>
            <PhotoExamplePlaceholder
              exampleImageUrl={guide.exampleImageUrl}
              categoryName={categoryName}
            />
            <p className="text-sm leading-relaxed text-slate-600">{guide.instruction}</p>
          </div>
        )}
      </div>
    </div>
  );
}
