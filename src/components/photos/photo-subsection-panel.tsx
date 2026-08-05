import type { ReactNode } from "react";
import { CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface PhotoSubsectionPanelProps {
  title: string;
  description?: string;
  guidance?: string;
  completedCount?: number;
  totalCount?: number;
  children: ReactNode;
  className?: string;
}

export function PhotoSubsectionPanel({
  title,
  description,
  guidance,
  completedCount,
  totalCount,
  children,
  className,
}: PhotoSubsectionPanelProps) {
  const hasProgress =
    typeof completedCount === "number" &&
    typeof totalCount === "number" &&
    totalCount > 0;
  const isComplete = hasProgress && completedCount >= totalCount;
  const remaining = hasProgress ? Math.max(0, totalCount - completedCount) : 0;

  return (
    <section className={cn("space-y-3", className)}>
      <header className="space-y-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h4 className="text-sm font-semibold text-foreground">{title}</h4>
          {hasProgress && (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold",
                isComplete
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-amber-100 text-amber-900",
              )}
            >
              {isComplete ? (
                <CheckCircle2 className="size-3.5" aria-hidden />
              ) : (
                <Clock className="size-3.5" aria-hidden />
              )}
              {isComplete
                ? "Concluído"
                : `${completedCount}/${totalCount} · ${remaining} restante${remaining === 1 ? "" : "s"}`}
            </span>
          )}
        </div>
        {description && (
          <p className="text-xs leading-relaxed text-muted-foreground">{description}</p>
        )}
        {guidance && (
          <p className="rounded-lg border border-sky-200/80 bg-sky-50/60 px-3 py-2 text-xs leading-relaxed text-sky-900">
            {guidance}
          </p>
        )}
        {hasProgress && (
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                isComplete ? "bg-emerald-500" : "gradient-primary",
              )}
              style={{ width: `${Math.round((completedCount / totalCount) * 100)}%` }}
            />
          </div>
        )}
      </header>
      {children}
    </section>
  );
}
