import { TrendingDown, TrendingUp, type LucideIcon } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface KpiCardProps {
  label?: string;
  title?: string;
  value: string;
  icon?: LucideIcon;
  isLoading?: boolean;
  trend?: string;
  trendUp?: boolean;
  /** Card isolado, fora de um StatsGrid: desenha a própria superfície */
  standalone?: boolean;
  className?: string;
}

export function KpiCard({
  label,
  title,
  value,
  icon: Icon,
  isLoading,
  trend,
  trendUp,
  standalone,
  className,
}: KpiCardProps) {
  const heading = title ?? label ?? "";

  return (
    <div
      className={cn(
        "flex h-full min-h-[9.5rem] min-w-0 flex-col items-center justify-center gap-4 bg-card p-5 text-center sm:p-6",
        standalone && "ui-panel ui-panel-interactive",
        className,
      )}
    >
      {Icon && (
        <span className="ui-icon-box h-10 w-10">
          <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
        </span>
      )}

      <div className="flex w-full min-w-0 flex-col items-center gap-2">
        <p className="ui-microlabel">{heading}</p>

        {isLoading ? (
          <div className="h-8 w-28 rounded-md bg-muted" />
        ) : (
          <>
            <p className="ui-metric text-[1.75rem] font-bold leading-none text-foreground sm:text-[2rem]">
              {value}
            </p>
            {trend && (
              <span className={trendUp ? "ui-chip-positive" : "ui-chip-negative"}>
                {trendUp ? (
                  <TrendingUp className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                )}
                {trend}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}
