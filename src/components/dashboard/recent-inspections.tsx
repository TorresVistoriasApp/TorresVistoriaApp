import { Link } from "react-router-dom";
import { ChevronRight, ClipboardList } from "lucide-react";
import { useRecentInspections } from "@/hooks/use-dashboard";
import { formatDate } from "@/lib/formatters";
import { ROUTES } from "@/lib/constants";
import { VistoriaStatusBadge } from "@/components/vistoria/vistoria-status-badge";

export function RecentInspections() {
  const { data: recent = [], isLoading } = useRecentInspections();

  return (
    <div className="surface-interactive overflow-hidden">
      <div className="flex items-center justify-between border-b border-border/50 px-5 py-4 md:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ClipboardList className="h-5 w-5" strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-base font-bold">Últimas vistorias</h3>
            <p className="text-xs text-muted-foreground">Acesso rápido aos laudos recentes</p>
          </div>
        </div>
      </div>

      <div className="divide-y divide-border/50">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse bg-muted/30" />
          ))
        ) : recent.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            Nenhuma vistoria encontrada
          </p>
        ) : (
          recent.map((inspection) => (
            <Link
              key={inspection.id}
              to={ROUTES.inspection(inspection.id)}
              className="group flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-primary/[0.03] md:px-6"
            >
              <div className="flex min-w-0 items-center gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted/80 text-xs font-bold text-primary">
                  #{inspection.inspection_number}
                </div>
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold">
                      {inspection.brand} {inspection.model}
                    </span>
                    <VistoriaStatusBadge status={inspection.status} />
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {inspection.plate} · {inspection.client_name}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {formatDate(inspection.inspection_date)}
                  </p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
