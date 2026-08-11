import { lazy, Suspense, useState } from "react";
import {
  BarChart3,
  CheckCircle2,
  ClipboardList,
  Clock3,
  DollarSign,
  PieChart,
  Plus,
  TrendingUp,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  useDashboardMetrics,
  useMonthlyInspections,
  useInspectionsByBrand,
} from "@/modules/torres-vistoria/hooks/use-dashboard";
import { useDashboardScope } from "@/modules/torres-vistoria/hooks/use-dashboard-scope";
import { StatsGrid, type StatItem } from "@/shared/components/charts/stats-grid";
import { ChartWrapper } from "@/shared/components/charts/chart-wrapper";
import { RecentInspections } from "@/modules/torres-vistoria/components/dashboard/recent-inspections";
import { DashboardScopeBanner } from "@/modules/torres-vistoria/components/dashboard/dashboard-scope-banner";
import { PageHeader } from "@/shared/components/page-header";
import { LoadingSpinner } from "@/shared/components/loading-spinner";
import { Button } from "@/shared/ui/button";
import { formatCurrency, formatNumber } from "@/shared/lib/formatters";
import { ROUTES } from "@/config/routes";
import type { DashboardMetrics } from "@/modules/torres-vistoria/types/dashboard";

const MonthlyOverview = lazy(() =>
  import("@/modules/torres-vistoria/components/dashboard/monthly-overview").then((m) => ({ default: m.MonthlyOverview })),
);
const RevenueChart = lazy(() =>
  import("@/modules/torres-vistoria/components/charts/revenue-chart").then((m) => ({ default: m.RevenueChart })),
);
const InspectionsPieChart = lazy(() =>
  import("@/modules/torres-vistoria/components/charts/inspections-pie-chart").then((m) => ({
    default: m.InspectionsPieChart,
  })),
);

const MONTHLY_CHART_WINDOW_SIZE = 6;

function ChartFallback() {
  return (
    <div className="flex h-64 items-center justify-center">
      <LoadingSpinner label="Carregando gráfico..." />
    </div>
  );
}

function getDefaultMonthlyWindowStart() {
  return new Date().getMonth() >= MONTHLY_CHART_WINDOW_SIZE ? MONTHLY_CHART_WINDOW_SIZE : 0;
}

function buildStatItems(
  stats: DashboardMetrics | undefined,
  isLoading: boolean,
  isCompanyView: boolean,
  canViewFinancial: boolean,
): StatItem[] {
  const marginPct =
    stats?.totalRevenue && stats.totalRevenue > 0
      ? ((stats.netProfit / stats.totalRevenue) * 100).toFixed(1) + "%"
      : undefined;

  const items: StatItem[] = [
    {
      title: isCompanyView ? "Total vistorias" : "Suas vistorias",
      value: formatNumber(stats?.totalInspections ?? 0),
      icon: ClipboardList,
      isLoading,
    },
    {
      title: isCompanyView ? "Em andamento" : "Suas em andamento",
      value: formatNumber(stats?.pendingInspections ?? 0),
      icon: Clock3,
      isLoading,
    },
    {
      title: isCompanyView ? "Concluídas" : "Suas concluídas",
      value: formatNumber(stats?.completedInspections ?? 0),
      icon: CheckCircle2,
      isLoading,
    },
    {
      title: isCompanyView ? "Faturamento (ano)" : "Seu faturamento (ano)",
      value: formatCurrency(stats?.totalRevenue ?? 0),
      icon: DollarSign,
      isLoading,
    },
  ];

  if (canViewFinancial && isCompanyView) {
    items.push({
      title: "Lucro líquido",
      value: formatCurrency(stats?.netProfit ?? 0),
      icon: TrendingUp,
      isLoading,
      trend: marginPct,
      trendUp: (stats?.netProfit ?? 0) >= 0,
    });
  }

  items.push({
    title: "Ticket médio",
    value: formatCurrency(stats?.averageTicket ?? 0),
    icon: Users,
    isLoading,
  });

  return items;
}

function DashboardCharts({
  monthly,
  brands,
  isCompanyView,
  inspectionMonthStart,
  revenueMonthStart,
  onInspectionMonthChange,
  onRevenueMonthChange,
}: {
  monthly: Array<{ month: string; count: number; revenue: number }>;
  brands: Array<{ brand: string; count: number }>;
  isCompanyView: boolean;
  inspectionMonthStart: number;
  revenueMonthStart: number;
  onInspectionMonthChange: (direction: "prev" | "next") => void;
  onRevenueMonthChange: (direction: "prev" | "next") => void;
}) {
  const maxVisibleMonthStart = Math.max(monthly.length - MONTHLY_CHART_WINDOW_SIZE, 0);
  const currentInspectionMonthStart = Math.min(inspectionMonthStart, maxVisibleMonthStart);
  const currentRevenueMonthStart = Math.min(revenueMonthStart, maxVisibleMonthStart);

  return (
    <div className="grid gap-4 xl:grid-cols-12 xl:gap-5">
      <ChartWrapper
        className="xl:col-span-6"
        title="Visão mensal"
        description={
          isCompanyView
            ? "Evolução de todas as vistorias da empresa"
            : "Evolução das suas vistorias por mês"
        }
        icon={BarChart3}
      >
        <Suspense fallback={<ChartFallback />}>
          <MonthlyOverview
            data={monthly}
            visibleStart={currentInspectionMonthStart}
            visibleSize={MONTHLY_CHART_WINDOW_SIZE}
            canPrevious={currentInspectionMonthStart > 0}
            canNext={currentInspectionMonthStart < maxVisibleMonthStart}
            onPrevious={() => onInspectionMonthChange("prev")}
            onNext={() => onInspectionMonthChange("next")}
          />
        </Suspense>
      </ChartWrapper>

      <ChartWrapper
        className="xl:col-span-6"
        title="Receita"
        description={
          isCompanyView
            ? "Valores reais das vistorias e lançamentos da empresa"
            : "Valores das suas vistorias conforme tipos cadastrados"
        }
        icon={TrendingUp}
      >
        <Suspense fallback={<ChartFallback />}>
          <RevenueChart
            data={monthly}
            visibleStart={currentRevenueMonthStart}
            visibleSize={MONTHLY_CHART_WINDOW_SIZE}
            canPrevious={currentRevenueMonthStart > 0}
            canNext={currentRevenueMonthStart < maxVisibleMonthStart}
            onPrevious={() => onRevenueMonthChange("prev")}
            onNext={() => onRevenueMonthChange("next")}
          />
        </Suspense>
      </ChartWrapper>

      <ChartWrapper
        className="xl:col-span-5"
        title="Vistorias por marca"
        description={
          isCompanyView ? "Participação por fabricante na empresa" : "Marcas das suas vistorias"
        }
        icon={PieChart}
      >
        <Suspense fallback={<ChartFallback />}>
          <InspectionsPieChart data={brands} />
        </Suspense>
      </ChartWrapper>

      <div className="xl:col-span-7">
        <RecentInspections />
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { isCompanyView, canViewFinancial } = useDashboardScope();
  const { data: stats, isLoading: statsLoading } = useDashboardMetrics();
  const { data: monthly = [] } = useMonthlyInspections();
  const { data: brands = [] } = useInspectionsByBrand();
  const [inspectionMonthStart, setInspectionMonthStart] = useState(getDefaultMonthlyWindowStart);
  const [revenueMonthStart, setRevenueMonthStart] = useState(getDefaultMonthlyWindowStart);

  const headerDescription = isCompanyView
    ? "Visão completa da empresa: vistorias, financeiro, equipe e indicadores"
    : "Suas vistorias, estatísticas pessoais e histórico recente";

  const shiftWindow = (
    setter: React.Dispatch<React.SetStateAction<number>>,
    direction: "prev" | "next",
    maxStart: number,
  ) => {
    setter((current) => {
      if (direction === "prev") {
        return Math.max(current - MONTHLY_CHART_WINDOW_SIZE, 0);
      }
      return Math.min(current + MONTHLY_CHART_WINDOW_SIZE, maxStart);
    });
  };

  const maxVisibleMonthStart = Math.max(monthly.length - MONTHLY_CHART_WINDOW_SIZE, 0);

  return (
    <div className="min-w-0 space-y-6">
      <PageHeader
        title="Dashboard"
        badge={isCompanyView ? "Empresa" : "Pessoal"}
        description={headerDescription}
        actions={
          <Button asChild className="touch-target w-full sm:w-auto" size="lg">
            <Link to={ROUTES.inspectionNew}>
              <Plus className="h-4 w-4" />
              Nova vistoria
            </Link>
          </Button>
        }
      />

      <DashboardScopeBanner />

      <StatsGrid
        items={buildStatItems(stats, statsLoading, isCompanyView, canViewFinancial)}
        className={isCompanyView ? "xl:grid-cols-3 2xl:grid-cols-6" : undefined}
      />

      <DashboardCharts
        monthly={monthly}
        brands={brands}
        isCompanyView={isCompanyView}
        inspectionMonthStart={inspectionMonthStart}
        revenueMonthStart={revenueMonthStart}
        onInspectionMonthChange={(direction) =>
          shiftWindow(setInspectionMonthStart, direction, maxVisibleMonthStart)
        }
        onRevenueMonthChange={(direction) =>
          shiftWindow(setRevenueMonthStart, direction, maxVisibleMonthStart)
        }
      />
    </div>
  );
}
