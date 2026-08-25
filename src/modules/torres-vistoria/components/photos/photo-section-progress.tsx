import type { PhotoCaptureStats } from "@/modules/torres-vistoria/domain/photos/photo-capture-stats";
import { cn } from "@/shared/lib/utils";

interface PhotoCaptureProgressSummaryProps {
  stats: PhotoCaptureStats;
  className?: string;
}

export function PhotoCaptureProgressSummary({ stats, className }: PhotoCaptureProgressSummaryProps) {
  const { completedSlots, totalSlots, remainingSlots, percentComplete, totalPhotos } = stats;

  return (
    <div className={cn("ui-panel px-3 py-3 sm:px-4 sm:py-3.5", className)}>
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="ui-microlabel">Progresso da vistoria</p>
          <p className="ui-metric text-base font-bold text-foreground sm:text-lg">
            {completedSlots} / {totalSlots}{" "}
            <span className="text-sm font-semibold text-muted-foreground sm:text-base">
              fotografias
            </span>
          </p>
        </div>
        <p className="ui-metric shrink-0 text-xl font-bold text-primary sm:text-2xl">
          {percentComplete}%
        </p>
      </div>

      <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-200 ease-out"
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
