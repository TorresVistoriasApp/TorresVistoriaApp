import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import {
  CHART_COLORS,
  chartTooltipStyle,
  getSeriesColor,
} from "@/shared/lib/chart-theme";

export type BrandChartPoint = {
  brand: string;
  count: number;
};

interface InspectionsPieChartProps {
  data: BrandChartPoint[];
}

export function InspectionsPieChart({ data }: InspectionsPieChartProps) {
  const topBrands = data.slice(0, 6);

  if (topBrands.length === 0) {
    return (
      <p className="flex min-h-[220px] items-center justify-center text-sm text-muted-foreground">
        Sem dados ainda
      </p>
    );
  }

  const total = topBrands.reduce((sum, b) => sum + b.count, 0);
  const segments = topBrands.map((item, index) => ({
    ...item,
    color: getSeriesColor(index),
    pct: total > 0 ? Math.round((item.count / total) * 100) : 0,
  }));

  return (
    <div className="flex flex-col gap-4">
      <div className="relative chart-responsive min-h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={segments}
              cx="50%"
              cy="50%"
              innerRadius="62%"
              outerRadius="82%"
              paddingAngle={2}
              dataKey="count"
              nameKey="brand"
              stroke={CHART_COLORS.surface}
              strokeWidth={2}
            >
              {segments.map((entry) => (
                <Cell key={entry.brand} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              {...chartTooltipStyle}
              formatter={(value: number, _name, item) => {
                const pct = total > 0 ? Math.round((value / total) * 100) : 0;
                return [`${value} vistorias (${pct}%)`, item.payload.brand as string];
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="ui-metric text-[2rem] font-bold leading-none text-foreground">{total}</p>
            <p className="ui-microlabel mt-1.5 block">total</p>
          </div>
        </div>
      </div>

      <ul className="ui-grid-hairline sm:grid-cols-2">
        {segments.map((item) => (
          <li
            key={item.brand}
            className="flex items-center justify-between bg-card px-3 py-2.5"
          >
            <div className="flex min-w-0 items-center gap-2.5">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="truncate text-sm font-semibold">{item.brand}</span>
            </div>
            <div className="ml-2 shrink-0 text-right">
              <span className="ui-metric text-sm font-bold text-foreground">{item.pct}%</span>
              <span className="ml-1.5 text-xs text-muted-foreground">({item.count})</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
