import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";
import { formatCurrency } from "@/lib/formatters";
import {
  CHART_COLORS,
  chartAxisStyle,
  chartTooltipStyle,
  formatMonthLabel,
  formatMonthRangeLabel,
  yAxisRevenueUpperBound,
} from "@/lib/chart-theme";
import { ChartResponsiveContainer } from "@/components/charts/chart-responsive-container";
import { MonthlyChartNavigation } from "@/components/charts/monthly-chart-navigation";
import { useSvgGradientRef } from "@/hooks/use-svg-gradient";

export type MonthlyChartPoint = {
  month: string;
  count?: number;
  revenue: number;
};

interface RevenueChartProps {
  data: MonthlyChartPoint[];
  visibleStart?: number;
  visibleSize?: number;
  canPrevious?: boolean;
  canNext?: boolean;
  onPrevious?: () => void;
  onNext?: () => void;
}

export function RevenueChart({
  data,
  visibleStart = 0,
  visibleSize = 6,
  canPrevious = false,
  canNext = false,
  onPrevious,
  onNext,
}: RevenueChartProps) {
  const barGradient = useSvgGradientRef("revenueBar");
  const chartData = data.map((row) => ({
    ...row,
    label: formatMonthLabel(row.month),
  }));

  if (chartData.length === 0) {
    return (
      <p className="flex h-full min-h-[200px] items-center justify-center text-sm text-muted-foreground">
        Sem dados de receita
      </p>
    );
  }

  const visibleData = chartData.slice(visibleStart, visibleStart + visibleSize);
  const firstMonth = visibleData.at(0)?.month;
  const lastMonth = visibleData.at(-1)?.month;
  const rangeLabel = firstMonth && lastMonth ? formatMonthRangeLabel(firstMonth, lastMonth) : "";
  const maxRevenue = Math.max(...visibleData.map((d) => Number(d.revenue) || 0), 0);
  const yMax = yAxisRevenueUpperBound(maxRevenue);
  const navigation =
    onPrevious && onNext ? (
      <MonthlyChartNavigation
        rangeLabel={rangeLabel}
        canPrevious={canPrevious}
        canNext={canNext}
        onPrevious={onPrevious}
        onNext={onNext}
      />
    ) : null;

  if (maxRevenue <= 0) {
    return (
      <div>
        {navigation}
        <p className="flex h-[220px] min-h-[200px] items-center justify-center text-sm text-muted-foreground sm:h-[260px] md:h-[280px]">
          Nenhuma receita registrada neste período
        </p>
      </div>
    );
  }

  return (
    <div>
      {navigation}
      <div className="chart-responsive">
        <ChartResponsiveContainer>
          <BarChart data={visibleData} margin={{ top: 12, right: 12, left: 0, bottom: 4 }}>
            <defs>
              <linearGradient id={barGradient.id} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART_COLORS.primaryLight} />
                <stop offset="100%" stopColor={CHART_COLORS.primary} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="6 6" vertical={false} />
            <XAxis dataKey="label" {...chartAxisStyle} interval={0} dy={8} />
            <YAxis
              {...chartAxisStyle}
              domain={[0, yMax]}
              tickFormatter={(value: number) =>
                value >= 1000 ? `R$${(value / 1000).toFixed(0)}k` : `R$${value}`
              }
              width={56}
              tickCount={5}
            />
            <Tooltip
              {...chartTooltipStyle}
              formatter={(value: number) => [formatCurrency(value), "Receita"]}
              labelFormatter={(label) => `Mês: ${label}`}
              cursor={{ fill: CHART_COLORS.primarySoft, opacity: 0.4, radius: 8 }}
            />
            <Bar
              dataKey="revenue"
              fill={barGradient.url}
              name="Receita"
              radius={[10, 10, 4, 4]}
              maxBarSize={56}
            />
          </BarChart>
        </ChartResponsiveContainer>
      </div>
    </div>
  );
}
