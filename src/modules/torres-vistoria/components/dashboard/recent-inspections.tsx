import { Link } from "react-router-dom";
import { ChevronRight, ClipboardList } from "lucide-react";
import { useRecentInspections } from "@/modules/torres-vistoria/hooks/use-dashboard";
import { useDashboardScope } from "@/modules/torres-vistoria/hooks/use-dashboard-scope";
import { formatDate } from "@/shared/lib/formatters";
import { ROUTES } from "@/config/routes";
import { VistoriaStatusBadge } from "@/modules/torres-vistoria/components/vistoria/vistoria-status-badge";

export function RecentInspections() {
  const { isCompanyView } = useDashboardScope();
  const { data: recent = [], isLoading } = useRecentInspections();

  return (
    <div className="ui-panel ui-panel-interactive flex h-full flex-col overflow-hidden">
      <div className="ui-panel-header items-center">
        <div className="flex min-w-0 items-center gap-3">
          <span className="ui-icon-box h-10 w-10">
            <ClipboardList className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
          </span>
          <div className="min-w-0">
            <h3 className="text-[17px] font-bold text-foreground">
              {isCompanyView ? "Últimas vistorias da empresa" : "Suas últimas vistorias"}
            </h3>
            <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">
              {isCompanyView
                ? "Acesso rápido às vistorias mais recentes da equipe"
                : "Acesso rápido aos seus laudos recentes"}
            </p>
          </div>
        </div>
      </div>

      <div className="divide-y divide-border">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-[76px] bg-muted" />
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
              className="group flex items-center justify-between gap-4 px-5 py-4 transition-colors duration-150 hover:bg-brand-subtle md:px-6"
            >
              <div className="flex min-w-0 items-center gap-4">
                <span className="ui-icon-box ui-metric h-11 w-11 text-[13px] font-bold">
                  #{inspection.inspection_number}
                </span>
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold">
                      {inspection.brand} {inspection.model}
                    </span>
                    <VistoriaStatusBadge status={inspection.status} />
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    <span className="font-mono font-semibold uppercase tracking-[0.08em] text-foreground">
                      {inspection.plate}
                    </span>
                    {" · "}
                    {inspection.client_name}
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
