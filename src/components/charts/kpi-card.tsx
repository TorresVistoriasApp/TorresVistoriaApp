import { cn } from "@/lib/utils";
import { TrendingDown, TrendingUp, type LucideIcon } from "lucide-react";

interface KpiCardProps {
  label?: string;
  title?: string;
  value: string;
  icon?: LucideIcon;
  isLoading?: boolean;
  trend?: string;
  trendUp?: boolean;
}

export function KpiCard({
  label,
  title,
  value,
  icon: Icon,
  isLoading,
  trend,
  trendUp,
}: KpiCardProps) {
  const heading = title ?? label ?? "";

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{heading}</p>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </div>
      <div className="mt-2">
        {isLoading ? (
          <div className="h-8 w-24 animate-pulse rounded bg-muted" />
        ) : (
          <p className="text-2xl font-bold">{value}</p>
        )}
      </div>
      {trend && (
        <div
          className={cn(
            "mt-1 flex items-center text-xs",
            trendUp ? "text-green-600" : "text-red-600",
          )}
        >
          {trendUp ? (
            <TrendingUp className="mr-1 h-3 w-3" />
          ) : (
            <TrendingDown className="mr-1 h-3 w-3" />
          )}
          {trend}
        </div>
      )}
    </div>
  );
}
