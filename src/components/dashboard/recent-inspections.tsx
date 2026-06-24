import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { useRecentInspections } from "@/hooks/use-dashboard";
import { formatDate } from "@/lib/formatters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { VistoriaStatusBadge } from "@/components/vistoria/vistoria-status-badge";

export function RecentInspections() {
  const { data: recent = [], isLoading } = useRecentInspections();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Últimas vistorias</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-14 animate-pulse rounded-lg bg-muted" />
          ))
        ) : recent.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Nenhuma vistoria encontrada
          </p>
        ) : (
          recent.map((inspection) => (
            <Link
              key={inspection.id}
              to={`/vistorias/${inspection.id}`}
              className="flex items-center justify-between rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
            >
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium">#{inspection.inspection_number}</span>
                  <VistoriaStatusBadge status={inspection.status} />
                </div>
                <p className="truncate text-xs text-muted-foreground">
                  {inspection.brand} {inspection.model} — {inspection.plate}
                </p>
                <p className="text-xs text-muted-foreground">
                  {inspection.client_name} · {formatDate(inspection.inspection_date)}
                </p>
              </div>
              <ChevronRight className="ml-2 h-4 w-4 shrink-0 text-muted-foreground" />
            </Link>
          ))
        )}
      </CardContent>
    </Card>
  );
}
