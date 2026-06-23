import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import { useDashboardMetrics, useRecentInspections } from "@/hooks/use-dashboard";
import { KpiCard } from "@/components/charts/kpi-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { ROUTES } from "@/lib/constants";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { VistoriaStatusBadge } from "@/components/vistoria/vistoria-status-badge";

export function Page() {
  const { data: metrics, isLoading: loadingMetrics } = useDashboardMetrics();
  const { data: recent = [], isLoading: loadingRecent } = useRecentInspections();

  if (loadingMetrics) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  const kpi = [
    { label: "Total de vistorias", value: String(metrics?.totalInspections ?? 0) },
    { label: "Faturamento", value: formatCurrency(metrics?.totalRevenue ?? 0) },
    { label: "Lucro líquido", value: formatCurrency(metrics?.netProfit ?? 0) },
    { label: "Ticket médio", value: formatCurrency(metrics?.averageTicket ?? 0) },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Indicadores em tempo real</p>
        </div>
        <Button asChild>
          <Link to={ROUTES.inspectionNew}>
            <Plus className="h-4 w-4" />
            Nova vistoria
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpi.map((m) => (
          <KpiCard key={m.label} label={m.label} value={m.value} />
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Vistorias recentes</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingRecent ? (
            <LoadingSpinner />
          ) : recent.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma vistoria registrada.</p>
          ) : (
            <ul className="divide-y divide-border">
              {recent.map((item) => (
                <li key={item.id} className="flex items-center justify-between py-3">
                  <Link to={`/vistorias/${item.id}`} className="hover:underline">
                    <span className="font-medium">#{item.inspection_number} {item.plate}</span>
                    <span className="ml-2 text-sm text-muted-foreground">
                      {item.brand} {item.model}
                    </span>
                  </Link>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{formatDate(item.inspection_date)}</span>
                    <VistoriaStatusBadge status={item.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
