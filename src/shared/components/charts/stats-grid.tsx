import { KpiCard } from "@/shared/components/charts/kpi-card";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/shared/lib/utils";

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

/** Colunas derivadas da quantidade — evita célula vazia mostrando a cor da borda */
function columnsClass(count: number) {
  if (count <= 1) return "";
  if (count === 2) return "sm:grid-cols-2";
  if (count === 3) return "sm:grid-cols-2 lg:grid-cols-3";
  return "sm:grid-cols-2 xl:grid-cols-4";
}

export function StatsGrid({ items, className }: StatsGridProps) {
  if (items.length === 0) return null;

  return (
    <div className={cn("ui-grid-hairline", columnsClass(items.length), className)}>
      {items.map((item) => (
        <KpiCard key={item.title} {...item} />
      ))}
    </div>
  );
}
