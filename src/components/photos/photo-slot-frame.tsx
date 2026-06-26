import type { LucideIcon } from "lucide-react";
import { Camera, CheckCircle2 } from "lucide-react";
import { TechnicalIllustration } from "@/components/photos/technical-illustration";
import type { PhotoVisualGuide } from "@/lib/photos/types";
import { cn } from "@/lib/utils";

/** Grid responsivo padrão — 2 colunas mobile, 3 tablet, 4 desktop. */
export const PHOTO_SLOT_GRID_CLASS =
  "grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4 lg:gap-4";

interface PhotoSlotFrameProps {
  label: string;
  hint: string;
  icon: LucideIcon;
  visualGuide?: PhotoVisualGuide;
  imageUrl?: string | null;
  indexBadge?: number;
  countBadge?: number;
  isUploading?: boolean;
  disabled?: boolean;
  required?: boolean;
  compact?: boolean;
  onClick?: () => void;
  className?: string;
}

export function PhotoSlotFrame({
  label,
  hint,
  icon: Icon,
  visualGuide,
  imageUrl,
  indexBadge,
  countBadge,
  isUploading,
  disabled,
  required,
  compact = true,
  onClick,
  className,
}: PhotoSlotFrameProps) {
  const isFilled = Boolean(imageUrl);
  const isInteractive = Boolean(onClick);
  const Wrapper = isInteractive ? "button" : "div";

  return (
    <Wrapper
      type={isInteractive ? "button" : undefined}
      disabled={isInteractive ? disabled : undefined}
      onClick={onClick}
      className={cn(
        "group relative flex h-full min-w-0 flex-col overflow-hidden rounded-xl border-2 text-left transition-all duration-200",
        isFilled
          ? "border-primary/30 bg-card shadow-soft"
          : "border-dashed border-primary/20 bg-white hover:border-primary/40 hover:shadow-sm",
        isInteractive && disabled && !isUploading && "opacity-60",
        !isInteractive && isFilled && "shadow-soft",
        className,
      )}
    >
      {required && !isFilled && (
        <span className="absolute right-1.5 top-1.5 z-10 rounded bg-amber-100 px-1 py-0.5 text-[8px] font-bold uppercase leading-none text-amber-800 sm:text-[9px]">
          Obrig.
        </span>
      )}

      <div
        className={cn(
          "relative w-full overflow-hidden",
          compact ? "aspect-square sm:aspect-[4/3]" : "aspect-[4/3]",
        )}
      >
        {isFilled ? (
          <>
            <img src={imageUrl!} alt={label} className="h-full w-full object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
            {indexBadge != null ? (
              <div className="absolute left-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow-md sm:size-7 sm:text-xs">
                {indexBadge}
              </div>
            ) : (
              !isUploading && (
                <div className="absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-emerald-500 text-white shadow-md sm:size-7">
                  {countBadge != null && countBadge > 1 ? (
                    <span className="text-[10px] font-bold sm:text-xs">{countBadge}</span>
                  ) : (
                    <CheckCircle2 className="size-3.5 sm:size-4" />
                  )}
                </div>
              )
            )}
          </>
        ) : (
          <div className="relative h-full w-full bg-gradient-to-b from-slate-50 to-slate-100/80">
            {visualGuide ? (
              <div className="absolute inset-1.5 sm:inset-2.5">
                <TechnicalIllustration
                  illustrationId={visualGuide.illustrationId}
                  highlightPartId={visualGuide.highlightPartId}
                  label={visualGuide.highlightLabel ?? label}
                />
              </div>
            ) : (
              <div className="flex h-full items-center justify-center">
                <div className="flex size-10 items-center justify-center rounded-xl border border-slate-200 bg-white/80 text-primary/70 sm:size-12">
                  <Icon className="size-5 sm:size-6" strokeWidth={1.5} />
                </div>
              </div>
            )}

            <div className="absolute bottom-1.5 right-1.5 flex items-center gap-0.5 rounded-md bg-white/95 px-1.5 py-1 shadow-sm ring-1 ring-slate-200/80 transition-transform group-hover:scale-105 sm:bottom-2 sm:right-2 sm:gap-1 sm:px-2">
              <Camera className="size-3 text-primary sm:size-3.5" />
              <span className="text-[8px] font-bold uppercase tracking-wide text-primary sm:text-[9px]">
                Capturar
              </span>
            </div>
          </div>
        )}

        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-[1px]">
            <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent sm:size-7" />
          </div>
        )}
      </div>

      <div className="border-t border-border/60 bg-white px-2 py-2 sm:px-3 sm:py-2.5">
        <p className="line-clamp-2 text-[11px] font-bold leading-tight text-foreground sm:text-xs">
          {label}
        </p>
        <p className="mt-0.5 hidden line-clamp-2 text-[10px] leading-snug text-muted-foreground sm:block">
          {hint}
        </p>
      </div>
    </Wrapper>
  );
}
