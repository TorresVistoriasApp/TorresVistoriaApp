import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

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
    label: row.month.slice(5) + "/" + row.month.slice(2, 4),
  }));

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <h3 className="mb-4 text-sm font-medium">Evolução mensal</h3>
      <div className="h-[250px]">
        {chartData.length === 0 ? (
          <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Sem vistorias registradas
          </p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="count"
                stroke="#1e40af"
                strokeWidth={2}
                name="Vistorias"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
