import { Link } from "react-router-dom";
import { ClipboardList, DollarSign, Plus, TrendingUp, Users } from "lucide-react";
import {
  useDashboardMetrics,
  useMonthlyInspections,
  useInspectionsByBrand,
} from "@/hooks/use-dashboard";
import { StatsGrid } from "@/components/dashboard/stats-grid";
import { ChartWrapper } from "@/components/charts/chart-wrapper";
import { RevenueChart } from "@/components/charts/revenue-chart";
import { InspectionsPieChart } from "@/components/charts/inspections-pie-chart";
import { MonthlyOverview } from "@/components/dashboard/monthly-overview";
import { RecentInspections } from "@/components/dashboard/recent-inspections";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatNumber } from "@/lib/formatters";
import { ROUTES } from "@/lib/constants";

export function Page() {
  const { data: stats, isLoading: statsLoading } = useDashboardMetrics();
  const { data: monthly = [] } = useMonthlyInspections();
  const { data: brands = [] } = useInspectionsByBrand();

  const marginPct =
    stats?.totalRevenue && stats.totalRevenue > 0
      ? ((stats.netProfit / stats.totalRevenue) * 100).toFixed(1) + "%"
      : undefined;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Indicadores em tempo real</p>
        </div>
        <Button asChild className="touch-target">
          <Link to={ROUTES.inspectionNew}>
            <Plus className="h-4 w-4" />
            Nova vistoria
          </Link>
        </Button>
      </div>

      <StatsGrid
        items={[
          {
            title: "Total vistorias",
            value: formatNumber(stats?.totalInspections ?? 0),
            icon: ClipboardList,
            isLoading: statsLoading,
          },
          {
            title: "Faturamento",
            value: formatCurrency(stats?.totalRevenue ?? 0),
            icon: DollarSign,
            isLoading: statsLoading,
          },
          {
            title: "Lucro líquido",
            value: formatCurrency(stats?.netProfit ?? 0),
            icon: TrendingUp,
            isLoading: statsLoading,
            trend: marginPct,
            trendUp: (stats?.netProfit ?? 0) >= 0,
          },
          {
            title: "Ticket médio",
            value: formatCurrency(stats?.averageTicket ?? 0),
            icon: Users,
            isLoading: statsLoading,
          },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartWrapper title="Visão mensal">
          <MonthlyOverview data={monthly} />
        </ChartWrapper>
        <div className="space-y-6">
          <ChartWrapper title="Receita">
            <RevenueChart data={monthly} />
          </ChartWrapper>
          <ChartWrapper title="Vistorias por marca">
            <InspectionsPieChart data={brands} />
          </ChartWrapper>
        </div>
      </div>

      <RecentInspections />
    </div>
  );
}
