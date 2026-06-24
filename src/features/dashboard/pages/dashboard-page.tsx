import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { formatCurrency } from "@/shared/lib/utils";
import { ROUTES } from "@/lib/constants";

const metrics = [
  { label: "Total de vistorias", value: "0" },
  { label: "Faturamento", value: formatCurrency(0) },
  { label: "Lucro líquido", value: formatCurrency(0) },
  { label: "Ticket médio", value: formatCurrency(0) },
];

export function DashboardPage() {
  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Indicadores em tempo real da operação
          </p>
        </div>
        <Button asChild>
          <Link to={ROUTES.inspectionNew}>
            <Plus className="h-4 w-4" />
            Nova vistoria
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{metric.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gráficos</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Gráficos de evolução mensal, marcas e vistoriadores serão exibidos aqui
            assim que houver dados no sistema.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
