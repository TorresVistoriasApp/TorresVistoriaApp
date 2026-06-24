import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

export type BrandChartPoint = {
  brand: string;
  count: number;
};

interface InspectionsPieChartProps {
  data: BrandChartPoint[];
}

const COLORS = ["#1e40af", "#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe", "#dbeafe"];

export function InspectionsPieChart({ data }: InspectionsPieChartProps) {
  const topBrands = data.slice(0, 6);

  if (topBrands.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <h3 className="mb-4 text-sm font-medium">Top marcas</h3>
        <p className="py-8 text-center text-sm text-muted-foreground">Sem dados ainda</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <h3 className="mb-4 text-sm font-medium">Top marcas</h3>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={topBrands}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
              dataKey="count"
              nameKey="brand"
            >
              {topBrands.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
