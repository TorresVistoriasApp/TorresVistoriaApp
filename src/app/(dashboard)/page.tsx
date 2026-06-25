import { useState } from "react";
import { Link } from "react-router-dom";
import {
  BarChart3,
  ClipboardList,
  DollarSign,
  PieChart,
  Plus,
  TrendingUp,
  Users,
} from "lucide-react";
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
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatNumber } from "@/lib/formatters";
import { ROUTES } from "@/lib/constants";
import { useAuth } from "@/hooks/use-auth";
import { UserRole } from "@/lib/enums";

const MONTHLY_CHART_WINDOW_SIZE = 6;

function getDefaultMonthlyWindowStart() {
  return new Date().getMonth() >= MONTHLY_CHART_WINDOW_SIZE ? MONTHLY_CHART_WINDOW_SIZE : 0;
}

export function Page() {
  const { profile } = useAuth();
  const isAdmin = profile?.role === UserRole.SUPER_ADMIN;
  const { data: stats, isLoading: statsLoading } = useDashboardMetrics();
  const { data: monthly = [] } = useMonthlyInspections();
  const { data: brands = [] } = useInspectionsByBrand();
  const [inspectionMonthStart, setInspectionMonthStart] = useState(getDefaultMonthlyWindowStart);
  const [revenueMonthStart, setRevenueMonthStart] = useState(getDefaultMonthlyWindowStart);

  const marginPct =
    stats?.totalRevenue && stats.totalRevenue > 0
      ? ((stats.netProfit / stats.totalRevenue) * 100).toFixed(1) + "%"
      : undefined;
  const maxVisibleMonthStart = Math.max(monthly.length - MONTHLY_CHART_WINDOW_SIZE, 0);
  const currentInspectionMonthStart = Math.min(inspectionMonthStart, maxVisibleMonthStart);
  const currentRevenueMonthStart = Math.min(revenueMonthStart, maxVisibleMonthStart);
  const canPreviousInspectionWindow = currentInspectionMonthStart > 0;
  const canNextInspectionWindow = currentInspectionMonthStart < maxVisibleMonthStart;
  const canPreviousRevenueWindow = currentRevenueMonthStart > 0;
  const canNextRevenueWindow = currentRevenueMonthStart < maxVisibleMonthStart;

  function showPreviousInspectionWindow() {
    setInspectionMonthStart((current) => Math.max(current - MONTHLY_CHART_WINDOW_SIZE, 0));
  }

  function showNextInspectionWindow() {
    setInspectionMonthStart((current) =>
      Math.min(current + MONTHLY_CHART_WINDOW_SIZE, maxVisibleMonthStart),
    );
  }

  function showPreviousRevenueWindow() {
    setRevenueMonthStart((current) => Math.max(current - MONTHLY_CHART_WINDOW_SIZE, 0));
  }

  function showNextRevenueWindow() {
    setRevenueMonthStart((current) =>
      Math.min(current + MONTHLY_CHART_WINDOW_SIZE, maxVisibleMonthStart),
    );
  }

  return (
    <div className="min-w-0 space-y-6">
      <PageHeader
        title="Dashboard"
        badge="Visão geral"
        description={
          isAdmin
            ? "Indicadores em tempo real com base nos valores configurados e vistorias registradas"
            : "Seus indicadores com base nos tipos de vistoria e valores cadastrados pela empresa"
        }
        actions={
          <Button asChild className="touch-target w-full sm:w-auto" size="lg">
            <Link to={ROUTES.inspectionNew}>
              <Plus className="h-4 w-4" />
              Nova vistoria
            </Link>
          </Button>
        }
      />

      <StatsGrid
        items={[
          {
            title: isAdmin ? "Total vistorias" : "Suas vistorias",
            value: formatNumber(stats?.totalInspections ?? 0),
            icon: ClipboardList,
            isLoading: statsLoading,
          },
          {
            title: isAdmin ? "Faturamento" : "Seu faturamento",
            value: formatCurrency(stats?.totalRevenue ?? 0),
            icon: DollarSign,
            isLoading: statsLoading,
          },
          ...(isAdmin
            ? [
                {
                  title: "Lucro líquido",
                  value: formatCurrency(stats?.netProfit ?? 0),
                  icon: TrendingUp,
                  isLoading: statsLoading,
                  trend: marginPct,
                  trendUp: (stats?.netProfit ?? 0) >= 0,
                },
              ]
            : []),
          {
            title: "Ticket médio",
            value: formatCurrency(stats?.averageTicket ?? 0),
            icon: Users,
            isLoading: statsLoading,
          },
        ]}
      />

      <div className="grid gap-4 xl:grid-cols-12 xl:gap-5">
        <ChartWrapper
          className="xl:col-span-6"
          title="Visão mensal"
          description="Evolução de vistorias realizadas"
          icon={BarChart3}
        >
          <MonthlyOverview
            data={monthly}
            visibleStart={currentInspectionMonthStart}
            visibleSize={MONTHLY_CHART_WINDOW_SIZE}
            canPrevious={canPreviousInspectionWindow}
            canNext={canNextInspectionWindow}
            onPrevious={showPreviousInspectionWindow}
            onNext={showNextInspectionWindow}
          />
        </ChartWrapper>

        <ChartWrapper
          className="xl:col-span-6"
          title="Receita"
          description="Valores reais das vistorias conforme tipos cadastrados"
          icon={TrendingUp}
        >
          <RevenueChart
            data={monthly}
            visibleStart={currentRevenueMonthStart}
            visibleSize={MONTHLY_CHART_WINDOW_SIZE}
            canPrevious={canPreviousRevenueWindow}
            canNext={canNextRevenueWindow}
            onPrevious={showPreviousRevenueWindow}
            onNext={showNextRevenueWindow}
          />
        </ChartWrapper>

        <ChartWrapper
          className="xl:col-span-5"
          title="Vistorias por marca"
          description="Participação por fabricante"
          icon={PieChart}
        >
          <InspectionsPieChart data={brands} />
        </ChartWrapper>

        <div className="xl:col-span-7">
          <RecentInspections />
        </div>
      </div>
    </div>
  );
}
