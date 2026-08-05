import type { ReactNode } from "react";
import { CheckCircle2, ChevronDown } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface PhotoSectionCardProps {
  id?: string;
  index: number;
  title: string;
  guidance?: string;
  isComplete?: boolean;
  photoCount?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
  className?: string;
}

export function PhotoSectionCard({
  id,
  index,
  title,
  guidance,
  isComplete = false,
  photoCount = 0,
  open,
  onOpenChange,
  children,
  className,
}: PhotoSectionCardProps) {
  return (
    <div id={id} className={cn("scroll-mt-24", className)}>
      <div
        className={cn(
          "overflow-hidden rounded-2xl border bg-card shadow-sm transition-colors",
          isComplete && !open ? "border-emerald-200/80 bg-emerald-50/30" : "border-border/80",
        )}
      >
        <button
          type="button"
          onClick={() => onOpenChange(!open)}
          className="flex w-full items-center gap-2.5 px-3 py-3 text-left transition-colors hover:bg-muted/30 sm:gap-3 sm:px-4 sm:py-3.5"
          aria-expanded={open}
        >
          <span
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold sm:size-9 sm:text-sm",
              isComplete
                ? "bg-emerald-100 text-emerald-700"
                : "bg-muted text-muted-foreground",
            )}
          >
            {isComplete ? <CheckCircle2 className="size-4 sm:size-[18px]" aria-hidden /> : index}
          </span>

          <span className="min-w-0 flex-1">
            <span className="flex items-center gap-2">
              <span className="truncate text-sm font-semibold text-foreground sm:text-base">
                {title}
              </span>
              {isComplete && (
                <span className="shrink-0 text-[10px] font-medium text-emerald-700 sm:text-xs">
                  Etapa concluída
                </span>
              )}
            </span>
            {!open && photoCount > 0 && (
              <span className="mt-0.5 block text-[11px] text-muted-foreground">
                {photoCount} foto{photoCount === 1 ? "" : "s"}
              </span>
            )}
          </span>

          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-muted-foreground transition-transform sm:size-5",
              open && "rotate-180",
            )}
            aria-hidden
          />
        </button>

        {open && (
          <div className="space-y-3 border-t border-border/60 px-3 pb-3 pt-2.5 sm:space-y-3.5 sm:px-4 sm:pb-4 sm:pt-3">
            {guidance && (
              <p className="text-[11px] leading-relaxed text-muted-foreground sm:text-xs">
                {guidance}
              </p>
            )}
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
