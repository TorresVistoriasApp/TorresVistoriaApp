import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatCurrency } from "@/lib/formatters";
import {
  CHART_COLORS,
  chartAxisStyle,
  chartTooltipStyle,
  formatMonthLabel,
  yAxisRevenueUpperBound,
} from "@/lib/chart-theme";

export type MonthlyChartPoint = {
  month: string;
  count?: number;
  revenue: number;
};

interface RevenueChartProps {
  data: MonthlyChartPoint[];
}

export function RevenueChart({ data }: RevenueChartProps) {
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

  const maxRevenue = Math.max(...chartData.map((d) => d.revenue), 0);
  const yMax = yAxisRevenueUpperBound(maxRevenue);

  return (
    <div className="chart-responsive">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 12, right: 12, left: -4, bottom: 4 }}>
          <defs>
            <linearGradient id="revenueBarGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={CHART_COLORS.primaryLight} />
              <stop offset="100%" stopColor={CHART_COLORS.primary} />
            </linearGradient>
            <linearGradient id="revenueBarHover" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FDBA74" />
              <stop offset="100%" stopColor={CHART_COLORS.primaryDark} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="6 6" vertical={false} />
          <XAxis dataKey="label" {...chartAxisStyle} interval="preserveStartEnd" dy={8} />
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
            fill="url(#revenueBarGradient)"
            name="Receita"
            radius={[10, 10, 4, 4]}
            maxBarSize={56}
          >
            {chartData.map((_, index) => (
              <Cell key={`bar-${index}`} fill="url(#revenueBarGradient)" />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
