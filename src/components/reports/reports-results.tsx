import { Link } from "react-router-dom";
import { ChevronRight, FileSearch, ListOrdered } from "lucide-react";
import type { Inspection } from "@/services/inspection-service";
import { VistoriaStatusBadge } from "@/components/vistoria/vistoria-status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDate } from "@/lib/formatters";
import { ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

type ReportsResultsProps = {
  inspections: Inspection[];
  isLoading?: boolean;
};

function ResultsSkeleton() {
  return (
    <div className="divide-y divide-border/50">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="flex items-center gap-4 px-5 py-4 md:px-6">
          <div className="h-11 w-11 shrink-0 animate-pulse rounded-xl bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-40 animate-pulse rounded bg-muted" />
            <div className="h-3 w-56 animate-pulse rounded bg-muted/80" />
          </div>
        </div>
      ))}
    </div>
  );
}

function InspectionRow({ inspection }: { inspection: Inspection }) {
  return (
    <Link
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
          <p className="text-[11px] text-muted-foreground lg:hidden">
            {formatDate(inspection.inspection_date)}
          </p>
        </div>
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary lg:hidden" />
    </Link>
  );
}

export function ReportsResults({ inspections, isLoading }: ReportsResultsProps) {
  const countLabel = `${inspections.length} vistoria${inspections.length !== 1 ? "s" : ""}`;

  return (
    <div className="surface-interactive overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-border/50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between md:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ListOrdered className="h-5 w-5" strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-base font-bold">Resultados</h3>
            <p className="text-xs text-muted-foreground">
              {isLoading ? "Carregando registros..." : countLabel}
            </p>
          </div>
        </div>
        {!isLoading && inspections.length > 0 && (
          <p className="text-xs text-muted-foreground sm:text-right">
            Clique em uma linha para abrir o laudo
          </p>
        )}
      </div>

      {isLoading ? (
        <ResultsSkeleton />
      ) : inspections.length === 0 ? (
        <div className="p-5 md:p-6">
          <EmptyState
            title="Nenhuma vistoria encontrada"
            description="Ajuste os filtros ou limpe a busca para visualizar mais registros."
          />
        </div>
      ) : (
        <>
          <div className="hidden lg:block">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50 bg-muted/30">
                    {["#", "Veículo", "Placa", "Cliente", "Data", "Status", ""].map((header) => (
                      <th
                        key={header || "action"}
                        className={cn(
                          "px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-widest text-muted-foreground md:px-6",
                          header === "" && "w-10",
                        )}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {inspections.map((inspection) => (
                    <tr
                      key={inspection.id}
                      className="group transition-colors hover:bg-primary/[0.03]"
                    >
                      <td className="px-5 py-4 md:px-6">
                        <span className="inline-flex h-9 min-h-0 min-w-9 items-center justify-center rounded-lg bg-muted/80 text-xs font-bold text-primary">
                          #{inspection.inspection_number}
                        </span>
                      </td>
                      <td className="px-5 py-4 font-medium md:px-6">
                        <div className="space-y-0.5">
                          <p>
                            {inspection.brand} {inspection.model}
                          </p>
                          {inspection.inspection_purpose && (
                            <p className="text-xs text-muted-foreground">
                              {inspection.inspection_purpose}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 font-mono text-xs font-semibold tracking-wide md:px-6">
                        {inspection.plate}
                      </td>
                      <td className="max-w-[220px] truncate px-5 py-4 text-muted-foreground md:px-6">
                        {inspection.client_name}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-muted-foreground md:px-6">
                        {formatDate(inspection.inspection_date)}
                      </td>
                      <td className="px-5 py-4 md:px-6">
                        <VistoriaStatusBadge status={inspection.status} />
                      </td>
                      <td className="px-3 py-4 md:px-4">
                        <Link
                          to={ROUTES.inspection(inspection.id)}
                          className="inline-flex h-9 min-h-0 min-w-9 items-center justify-center rounded-lg text-muted-foreground opacity-0 transition-all group-hover:opacity-100 hover:bg-primary/10 hover:text-primary"
                          aria-label={`Abrir vistoria #${inspection.inspection_number}`}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="divide-y divide-border/50 lg:hidden">
            {inspections.map((inspection) => (
              <InspectionRow key={inspection.id} inspection={inspection} />
            ))}
          </div>
        </>
      )}

      {!isLoading && inspections.length > 0 && (
        <div className="flex items-center gap-2 border-t border-border/50 bg-muted/20 px-5 py-3 text-[11px] text-muted-foreground md:px-6">
          <FileSearch className="h-3.5 w-3.5 shrink-0" />
          <span>
            Os arquivos exportados incluem marca, modelo e demais campos do laudo.
          </span>
        </div>
      )}
    </div>
  );
}
