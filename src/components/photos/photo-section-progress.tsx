import type { PhotoCaptureStats } from "@/lib/photos/photo-capture-stats";
import { cn } from "@/lib/utils";

interface PhotoCaptureProgressSummaryProps {
  stats: PhotoCaptureStats;
  className?: string;
}

export function PhotoCaptureProgressSummary({ stats, className }: PhotoCaptureProgressSummaryProps) {
  const { completedSlots, totalSlots, remainingSlots, percentComplete, totalPhotos } = stats;

  return (
    <div className={cn("rounded-2xl border border-border/80 bg-card px-3 py-3 shadow-sm sm:px-4 sm:py-3.5", className)}>
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0 space-y-0.5">
          <p className="text-xs font-medium text-muted-foreground">Progresso da vistoria</p>
          <p className="text-base font-bold tabular-nums text-foreground sm:text-lg">
            {completedSlots} / {totalSlots}{" "}
            <span className="text-sm font-semibold text-muted-foreground sm:text-base">
              fotografias
            </span>
          </p>
        </div>
        <p className="shrink-0 text-xl font-bold tabular-nums text-orange-600 sm:text-2xl">
          {percentComplete}%
        </p>
      </div>

      <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-gradient-to-r from-orange-500 to-orange-400 transition-all duration-500"
          style={{ width: `${percentComplete}%` }}
        />
      </div>

      <p className="mt-2 text-[11px] text-muted-foreground sm:text-xs">
        {remainingSlots > 0
          ? `${remainingSlots} restante${remainingSlots === 1 ? "" : "s"} na sequência`
          : "Sequência principal concluída"}
        {totalPhotos > completedSlots && ` · ${totalPhotos} fotos no total`}
      </p>
    </div>
  );
}
