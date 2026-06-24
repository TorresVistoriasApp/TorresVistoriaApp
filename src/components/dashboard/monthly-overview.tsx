import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  CHART_COLORS,
  chartAxisStyle,
  chartTooltipStyle,
  formatMonthLabel,
  yAxisUpperBound,
} from "@/lib/chart-theme";

export type MonthlyOverviewPoint = {
  month: string;
  count: number;
  revenue?: number;
};

interface MonthlyOverviewProps {
  data: MonthlyOverviewPoint[];
}

export function MonthlyOverview({ data }: MonthlyOverviewProps) {
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

  const maxCount = Math.max(...chartData.map((d) => d.count), 0);
  const yMax = yAxisUpperBound(maxCount);

  return (
    <div className="chart-responsive">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 12, right: 12, left: -8, bottom: 4 }}>
          <defs>
            <linearGradient id="countAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CHART_COLORS.primary} stopOpacity={0.35} />
              <stop offset="50%" stopColor={CHART_COLORS.primaryLight} stopOpacity={0.12} />
              <stop offset="100%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
            </linearGradient>
            <linearGradient id="countLineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={CHART_COLORS.primaryDark} />
              <stop offset="100%" stopColor={CHART_COLORS.primaryLight} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="6 6" vertical={false} />
          <XAxis dataKey="label" {...chartAxisStyle} interval="preserveStartEnd" dy={8} />
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
            stroke="url(#countLineGradient)"
            strokeWidth={3}
            fill="url(#countAreaGradient)"
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
      </ResponsiveContainer>
    </div>
  );
}
