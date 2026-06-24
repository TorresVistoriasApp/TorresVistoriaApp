import {
  Area,
  AreaChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  CHART_COLORS,
  chartAxisStyle,
  chartTooltipStyle,
  formatMonthLabel,
  formatMonthRangeLabel,
  yAxisUpperBound,
} from "@/lib/chart-theme";
import { ChartResponsiveContainer } from "@/components/charts/chart-responsive-container";
import { MonthlyChartNavigation } from "@/components/charts/monthly-chart-navigation";
import { useSvgGradientRef } from "@/hooks/use-svg-gradient";

export type MonthlyOverviewPoint = {
  month: string;
  count: number;
  revenue?: number;
};

interface MonthlyOverviewProps {
  data: MonthlyOverviewPoint[];
  visibleStart?: number;
  visibleSize?: number;
  canPrevious?: boolean;
  canNext?: boolean;
  onPrevious?: () => void;
  onNext?: () => void;
}

export function MonthlyOverview({
  data,
  visibleStart = 0,
  visibleSize = 6,
  canPrevious = false,
  canNext = false,
  onPrevious,
  onNext,
}: MonthlyOverviewProps) {
  const areaGradient = useSvgGradientRef("countArea");
  const lineGradient = useSvgGradientRef("countLine");
  const chartData = data.map((row) => ({
    ...row,
    label: formatMonthLabel(row.month),
  }));

  if (chartData.length === 0) {
    return (
      <p className="flex h-full min-h-[200px] items-center justify-center text-sm text-muted-foreground">
        Sem vistorias registradas
      </p>
    );
  }

  const visibleData = chartData.slice(visibleStart, visibleStart + visibleSize);
  const firstMonth = visibleData.at(0)?.month;
  const lastMonth = visibleData.at(-1)?.month;
  const rangeLabel = firstMonth && lastMonth ? formatMonthRangeLabel(firstMonth, lastMonth) : "";
  const maxCount = Math.max(...visibleData.map((d) => d.count), 0);
  const yMax = yAxisUpperBound(maxCount);

  return (
    <div>
      {onPrevious && onNext && (
        <MonthlyChartNavigation
          rangeLabel={rangeLabel}
          canPrevious={canPrevious}
          canNext={canNext}
          onPrevious={onPrevious}
          onNext={onNext}
        />
      )}
      <div className="chart-responsive">
        <ChartResponsiveContainer>
          <AreaChart data={visibleData} margin={{ top: 12, right: 12, left: -8, bottom: 4 }}>
            <defs>
              <linearGradient id={areaGradient.id} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART_COLORS.primary} stopOpacity={0.35} />
                <stop offset="50%" stopColor={CHART_COLORS.primaryLight} stopOpacity={0.12} />
                <stop offset="100%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
              </linearGradient>
              <linearGradient id={lineGradient.id} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor={CHART_COLORS.primaryDark} />
                <stop offset="100%" stopColor={CHART_COLORS.primaryLight} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="6 6" vertical={false} />
            <XAxis dataKey="label" {...chartAxisStyle} interval={0} dy={8} />
            <YAxis
              {...chartAxisStyle}
              allowDecimals={false}
              width={28}
              domain={[0, yMax]}
              tickCount={Math.min(yMax + 1, 6)}
            />
            <Tooltip
              {...chartTooltipStyle}
              formatter={(value: number) => [value, "Vistorias"]}
              labelFormatter={(label) => `Mês: ${label}`}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke={lineGradient.url}
              strokeWidth={3}
              fill={areaGradient.url}
              name="Vistorias"
              dot={{
                fill: CHART_COLORS.primary,
                stroke: "#FFFFFF",
                strokeWidth: 2,
                r: 5,
              }}
              activeDot={{
                r: 7,
                fill: CHART_COLORS.primaryDark,
                stroke: "#FFFFFF",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ChartResponsiveContainer>
      </div>
    </div>
  );
}
