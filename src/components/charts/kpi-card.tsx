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
    <div className="surface-interactive group relative overflow-hidden p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-3">
          <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            {heading}
          </p>
          {isLoading ? (
            <div className="h-9 w-32 animate-pulse rounded-lg bg-muted" />
          ) : (
            <p className="text-2xl font-bold tracking-tight sm:text-[1.75rem]">{value}</p>
          )}
          {trend && (
            <div
              className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
                trendUp ? "bg-emerald-500/10 text-emerald-700" : "bg-red-500/10 text-red-600",
              )}
            >
              {trendUp ? (
                <TrendingUp className="mr-1 h-3.5 w-3.5" />
              ) : (
                <TrendingDown className="mr-1 h-3.5 w-3.5" />
              )}
              {trend}
            </div>
          )}
        </div>
        {Icon && (
          <div
            className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br",
              iconTheme,
            )}
          >
            <Icon className="h-5 w-5" strokeWidth={2} />
          </div>
        )}
      </div>
    </div>
  );
}
