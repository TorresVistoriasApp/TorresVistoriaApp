import { CheckCircle2, Clock } from "lucide-react";
import type { PhotoSectionProgress } from "@/lib/photos/types";
import {
  formatEstimatedTime,
  getSectionStatusLabel,
} from "@/lib/photos/photo-progress";
import { cn } from "@/lib/utils";

interface PhotoSectionProgressBarProps {
  progress: PhotoSectionProgress;
  sectionName: string;
  className?: string;
}

export function PhotoSectionProgressBar({
  progress,
  sectionName,
  className,
}: PhotoSectionProgressBarProps) {
  const isComplete = progress.status === "COMPLETED";

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {isComplete ? (
            <CheckCircle2 className="size-4 text-emerald-600" strokeWidth={2.5} />
          ) : (
            <Clock className="size-4 text-muted-foreground" />
          )}
          <span className="text-xs font-semibold text-foreground">{sectionName}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{getSectionStatusLabel(progress.status)}</span>
          <span>·</span>
          <span>{progress.percentComplete}%</span>
        </div>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            isComplete ? "bg-emerald-500" : "gradient-primary",
          )}
          style={{ width: `${progress.percentComplete}%` }}
        />
      </div>

      <div className="flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
        <span>
          {progress.completedPhotos}/{progress.requiredPhotos} obrigatórias
        </span>
        {progress.remainingPhotos > 0 && <span>{progress.remainingPhotos} restante(s)</span>}
        <span>{formatEstimatedTime(progress.estimatedSecondsRemaining)}</span>
      </div>
    </div>
  );
}

interface PhotoCaptureProgressSummaryProps {
  percentComplete: number;
  totalCompleted: number;
  totalRequired: number;
  estimatedSecondsRemaining: number;
  totalPhotos: number;
  className?: string;
}

export function PhotoCaptureProgressSummary({
  percentComplete,
  totalCompleted,
  totalRequired,
  estimatedSecondsRemaining,
  totalPhotos,
  className,
}: PhotoCaptureProgressSummaryProps) {
  return (
    <div className={cn("rounded-xl border border-border bg-card p-4 shadow-soft sm:p-5", className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-semibold text-foreground">Progresso geral</p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {totalCompleted} de {totalRequired} fotografias obrigatórias concluídas.
            {totalRequired - totalCompleted > 0 &&
              ` Faltam ${totalRequired - totalCompleted} para continuar.`}
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-primary">{percentComplete}%</p>
          <p className="text-xs text-muted-foreground">
            {totalPhotos} foto{totalPhotos === 1 ? "" : "s"} · {formatEstimatedTime(estimatedSecondsRemaining)}
          </p>
        </div>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full gradient-primary transition-all duration-500"
          style={{ width: `${percentComplete}%` }}
        />
      </div>
    </div>
  );
}
