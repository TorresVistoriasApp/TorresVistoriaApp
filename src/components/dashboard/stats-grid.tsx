import { KpiCard } from "@/components/charts/kpi-card";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type StatItem = {
  title: string;
  value: string;
  icon?: LucideIcon;
  isLoading?: boolean;
  trend?: string;
  trendUp?: boolean;
};

type StatsGridProps = {
  items: StatItem[];
  className?: string;
};

export function StatsGrid({ items, className }: StatsGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4",
        className,
      )}
    >
      {items.map((item, index) => (
        <KpiCard key={item.title} {...item} themeIndex={index} />
      ))}
    </div>
  );
}
