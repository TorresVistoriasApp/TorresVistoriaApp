import { Camera, CheckCircle2, Eye, RotateCcw } from "lucide-react";
import { TechnicalIllustration } from "@/components/photos/technical-illustration";
import type { PhotoGuideCardStatus, PhotoTechnicalGuide } from "@/lib/photos/types";
import { cn } from "@/lib/utils";

/** Grid responsivo padrão — 2 colunas mobile, 3 tablet, 4 desktop. */
export const PHOTO_SLOT_GRID_CLASS =
  "grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4 lg:gap-4";

export type PhotoGuideCardProps = {
  categoryName: string;
  guide: PhotoTechnicalGuide;
  status: PhotoGuideCardStatus;
  required?: boolean;
  imageUrl?: string | null;
  indexBadge?: number;
  countBadge?: number;
  onCapture: () => void;
  onView?: () => void;
  onRetake?: () => void;
  className?: string;
};

/**
 * Card de captura — quadrado clicável com silhueta técnica (estilo manual automotivo).
 */
export function PhotoGuideCard({
  categoryName,
  guide,
  status,
  required,
  imageUrl,
  indexBadge,
  countBadge,
  onCapture,
  onView,
  onRetake,
  className,
}: PhotoGuideCardProps) {
  const hasPreview = Boolean(imageUrl);
  const isUploading = status === "uploading";
  const isCaptured = status === "captured" && hasPreview;

  return (
    <article
      className={cn(
        "group relative flex h-full min-w-0 flex-col overflow-hidden rounded-xl border-2 text-left transition-all duration-200",
        isCaptured
          ? "border-primary/30 bg-card shadow-soft"
          : "border-dashed border-primary/20 bg-white hover:border-primary/40 hover:shadow-sm",
        className,
      )}
    >
      {required && !isCaptured && (
        <span className="absolute right-1.5 top-1.5 z-10 rounded bg-amber-100 px-1 py-0.5 text-[8px] font-bold uppercase leading-none text-amber-800 sm:text-[9px]">
          Obrig.
        </span>
      )}

      <div className="relative min-h-0 flex-1">
        {hasPreview ? (
          <button
            type="button"
            onClick={isCaptured ? onView : onCapture}
            className="relative block aspect-square w-full sm:aspect-[4/3]"
          >
            <img
              src={imageUrl!}
              alt={categoryName}
              className="h-full w-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
            {indexBadge != null ? (
              <span className="absolute left-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-md sm:size-7 sm:text-xs">
                {indexBadge}
              </span>
            ) : (
              isCaptured && (
                <span className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md sm:size-7">
                  {countBadge != null && countBadge > 1 ? (
                    <span className="text-[10px] font-bold sm:text-xs">{countBadge}</span>
                  ) : (
                    <CheckCircle2 className="size-3.5 sm:size-4" />
                  )}
                </span>
              )
            )}
            {isCaptured && (
              <span className="absolute bottom-2 right-2 flex items-center gap-1 rounded-md bg-black/45 px-2 py-1 text-[9px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                <Eye className="size-3" />
                Ver
              </span>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={onCapture}
            disabled={isUploading}
            className={cn(
              "relative block aspect-square w-full touch-target sm:aspect-[4/3]",
              isUploading && "opacity-60",
            )}
          >
            <div className="relative h-full w-full bg-gradient-to-b from-slate-50 to-slate-100/80">
              <div className="absolute inset-1.5 sm:inset-2.5">
                <TechnicalIllustration
                  illustrationId={guide.illustrationId}
                  highlightPartId={guide.highlightPartId}
                  label={guide.highlightLabel ?? categoryName}
                />
              </div>

              <div className="absolute bottom-1.5 right-1.5 flex items-center gap-0.5 rounded-md bg-white/95 px-1.5 py-1 shadow-sm ring-1 ring-slate-200/80 transition-transform group-hover:scale-105 sm:bottom-2 sm:right-2 sm:gap-1 sm:px-2">
                <Camera className="size-3 text-primary sm:size-3.5" />
                <span className="text-[8px] font-bold uppercase tracking-wide text-primary sm:text-[9px]">
                  Capturar
                </span>
              </div>
            </div>
          </button>
        )}

        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-[1px]">
            <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent sm:size-7" />
          </div>
        )}
      </div>

      <footer className="border-t border-border/60 bg-white px-2 py-2 sm:px-3 sm:py-2.5">
        <p className="line-clamp-2 text-[11px] font-bold leading-tight text-foreground sm:text-xs">
          {categoryName}
        </p>
        {!hasPreview && (
          <p className="mt-0.5 hidden line-clamp-2 text-[10px] leading-snug text-muted-foreground sm:block">
            {guide.instruction}
          </p>
        )}
        {isCaptured && onRetake && (
          <button
            type="button"
            onClick={onRetake}
            className="mt-1.5 flex items-center gap-1 text-[10px] font-medium text-primary hover:underline"
          >
            <RotateCcw className="size-3" />
            Refazer
          </button>
        )}
      </footer>
    </article>
  );
}
