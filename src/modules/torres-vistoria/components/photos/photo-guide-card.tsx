import { Camera, CheckCircle2 } from "lucide-react";
import { TechnicalIllustration } from "@/modules/torres-vistoria/components/photos/technical-illustration";
import type { PhotoGuideCardStatus, PhotoTechnicalGuide } from "@/modules/torres-vistoria/domain/photos/types";
import { cn } from "@/shared/lib/utils";

/** Grid responsivo — mobile first, cards maiores. */
export const PHOTO_SLOT_GRID_CLASS =
  "grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-2.5 lg:grid-cols-4 lg:gap-3";

const FOOTER_MIN_HEIGHT = "min-h-[2.75rem] sm:min-h-[3rem]";

export type PhotoGuideCardProps = {
  categoryName: string;
  guide: PhotoTechnicalGuide;
  status: PhotoGuideCardStatus;
  imageUrl?: string | null;
  indexBadge?: number;
  onCapture: () => void;
  onView?: () => void;
  onRetake?: () => void;
  isRecommended?: boolean;
  subtitle?: string;
  className?: string;
};

export function PhotoGuideCard({
  categoryName,
  guide,
  status,
  imageUrl,
  indexBadge,
  onCapture,
  onView,
  isRecommended = false,
  subtitle,
  className,
}: PhotoGuideCardProps) {
  const hasPreview = Boolean(imageUrl);
  const isUploading = status === "uploading";
  const isCaptured = status === "captured" && hasPreview;

  return (
    <article
      className={cn(
        "group relative flex h-full min-w-0 flex-col overflow-hidden rounded-xl border bg-card text-left transition-colors duration-150",
        isCaptured
          ? "border-border shadow-soft"
          : isRecommended
            ? "border-primary shadow-elevated"
            : "border-border hover:border-border-strong",
        className,
      )}
    >
      {isRecommended && !isCaptured && (
        <span className="absolute left-1.5 top-1.5 z-10 rounded-md bg-primary px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-primary-foreground shadow-soft">
          Próxima
        </span>
      )}

      <div className="relative shrink-0">
        {hasPreview ? (
          <button
            type="button"
            onClick={isCaptured ? onView : onCapture}
            className="relative block aspect-[5/4] w-full touch-target"
          >
            <img
              src={imageUrl!}
              alt={categoryName}
              className="h-full w-full object-cover"
              loading="lazy"
              decoding="async"
            />
            {indexBadge != null ? (
              <span className="ui-metric absolute left-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {indexBadge}
              </span>
            ) : (
              isCaptured && (
                <span className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-success text-white shadow-soft">
                  <CheckCircle2 className="size-3.5" aria-hidden />
                </span>
              )
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={onCapture}
            disabled={isUploading}
            className={cn(
              "relative block aspect-[5/4] w-full touch-target",
              isUploading && "opacity-60",
            )}
          >
            <div className="relative h-full w-full bg-muted">
              <div className="absolute inset-2 sm:inset-2.5">
                <TechnicalIllustration
                  illustrationId={guide.illustrationId}
                  highlightPartId={guide.highlightPartId}
                  label={guide.highlightLabel ?? categoryName}
                />
              </div>
              <span className="absolute bottom-1.5 right-1.5 rounded-md border border-border bg-card p-1 shadow-soft">
                <Camera className="size-3.5 text-muted-foreground" aria-hidden />
              </span>
            </div>
          </button>
        )}

        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-canvas/80">
            <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}
      </div>

      <footer
        className={cn(
          "flex shrink-0 flex-col items-start border-t border-border px-2 py-1.5 sm:px-2.5 sm:py-2",
          FOOTER_MIN_HEIGHT,
        )}
      >
        <p className="line-clamp-2 w-full text-left text-[11px] font-semibold leading-snug text-foreground sm:text-xs">
          {categoryName}
        </p>
        {subtitle && (
          <p className="mt-0.5 line-clamp-1 w-full text-left text-[10px] text-muted-foreground">
            {subtitle}
          </p>
        )}
      </footer>
    </article>
  );
}
