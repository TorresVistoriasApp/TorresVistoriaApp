import type { LucideIcon } from "lucide-react";
import { CheckCircle2, ImagePlus } from "lucide-react";
import { cn } from "@/lib/utils";

interface PhotoSlotFrameProps {
  label: string;
  hint: string;
  icon: LucideIcon;
  imageUrl?: string | null;
  indexBadge?: number;
  countBadge?: number;
  isUploading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}

export function PhotoSlotFrame({
  label,
  hint,
  icon: Icon,
  imageUrl,
  indexBadge,
  countBadge,
  isUploading,
  disabled,
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
        "group relative flex flex-col overflow-hidden rounded-xl border-2 text-left transition-all duration-200",
        isFilled
          ? "border-primary/30 bg-card shadow-soft"
          : "border-dashed border-primary/25 bg-primary/[0.03] hover:border-primary/50 hover:bg-primary/[0.06]",
        isInteractive && disabled && !isUploading && "opacity-60",
        !isInteractive && isFilled && "shadow-soft",
        className,
      )}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        {isFilled ? (
          <>
            <img src={imageUrl!} alt={label} className="h-full w-full object-cover" loading="lazy" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            {indexBadge != null ? (
              <div className="absolute left-2 top-2 flex size-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-md">
                {indexBadge}
              </div>
            ) : (
              !isUploading && (
                <div className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-success text-white shadow-md">
                  {countBadge != null && countBadge > 1 ? (
                    <span className="text-xs font-bold">{countBadge}</span>
                  ) : (
                    <CheckCircle2 className="size-4" />
                  )}
                </div>
              )
            )}
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 p-3">
            <div className="flex size-12 items-center justify-center rounded-xl border border-primary/20 bg-primary/10 text-primary transition-transform group-hover:scale-105 sm:size-14">
              <Icon className="size-6 sm:size-7" strokeWidth={1.5} />
            </div>
            <span className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide text-primary/80">
              <ImagePlus className="size-3" />
              Adicionar
            </span>
          </div>
        )}

        {isUploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-[1px]">
            <div className="size-7 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        )}
      </div>

      <div className="border-t border-border/60 px-3 py-2.5">
        <p className="text-xs font-bold leading-tight">{label}</p>
        <p className="mt-0.5 line-clamp-2 text-[10px] leading-snug text-muted-foreground">{hint}</p>
      </div>
    </Wrapper>
  );
}
