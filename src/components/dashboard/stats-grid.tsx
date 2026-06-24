import { KpiCard } from "@/components/charts/kpi-card";
import type { LucideIcon } from "lucide-react";

export type StatItem = {
  title: string;
  value: string;
  icon?: LucideIcon;
  isLoading?: boolean;
  trend?: string;
  trendUp?: boolean;
};

export function StatsGrid({ items }: { items: StatItem[] }) {
  return (
    <div className="grid grid-cols-1 items-stretch gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
      {items.map((item, index) => (
        <KpiCard key={item.title} {...item} themeIndex={index} />
      ))}
    </div>
  );
}
