import { cn } from "@/lib/utils";
import { TrendingDown, TrendingUp, type LucideIcon } from "lucide-react";

const ICON_THEMES = [
  "from-orange-500/15 to-orange-500/5 text-orange-600",
  "from-amber-500/15 to-amber-500/5 text-amber-600",
  "from-emerald-500/15 to-emerald-500/5 text-emerald-600",
  "from-slate-500/15 to-slate-500/5 text-slate-600",
] as const;

interface KpiCardProps {
  label?: string;
  title?: string;
  value: string;
  icon?: LucideIcon;
  isLoading?: boolean;
  trend?: string;
  trendUp?: boolean;
  themeIndex?: number;
}

export function KpiCard({
  label,
  title,
  value,
  icon: Icon,
  isLoading,
  trend,
  trendUp,
  themeIndex = 0,
}: KpiCardProps) {
  const heading = title ?? label ?? "";
  const iconTheme = ICON_THEMES[themeIndex % ICON_THEMES.length];

  return (
    <div className="surface-interactive relative flex h-full min-h-[120px] items-center justify-center overflow-hidden p-5">
      {Icon && (
        <div
          className={cn(
            "pointer-events-none absolute right-3.5 top-3.5 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br",
            iconTheme,
          )}
          aria-hidden
        >
          <Icon className="h-4 w-4" strokeWidth={2} />
        </div>
      )}

      <div className="flex w-full min-h-[92px] flex-col items-center justify-center gap-1.5 text-center">
        <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          {heading}
        </p>
        {isLoading ? (
          <div className="h-9 w-32 animate-pulse rounded-lg bg-muted" />
        ) : (
          <>
            <p className="text-2xl font-bold tracking-tight sm:text-[1.75rem]">{value}</p>
            {trend && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
                  trendUp ? "bg-emerald-500/10 text-emerald-700" : "bg-red-500/10 text-red-600",
                )}
              >
                {trendUp ? (
                  <TrendingUp className="h-3.5 w-3.5" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5" />
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
