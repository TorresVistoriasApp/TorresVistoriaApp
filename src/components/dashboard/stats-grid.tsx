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
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {items.map((item) => (
        <KpiCard key={item.title} {...item} />
      ))}
    </div>
  );
}
