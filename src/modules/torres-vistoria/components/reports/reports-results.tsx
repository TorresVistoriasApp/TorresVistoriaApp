import { Link } from "react-router-dom";
import { ChevronRight, FileSearch, ListOrdered } from "lucide-react";
import type { Inspection } from "@/modules/torres-vistoria/services/inspection-service";
import { VistoriaStatusBadge } from "@/modules/torres-vistoria/components/vistoria/vistoria-status-badge";
import { EmptyState } from "@/shared/components/empty-state";
import { formatDate } from "@/shared/lib/formatters";
import { ROUTES } from "@/config/routes";
import { cn } from "@/shared/lib/utils";

type ReportsResultsProps = {
  inspections: Inspection[];
  isLoading?: boolean;
};

function ResultsSkeleton() {
  return (
    <div className="divide-y divide-border">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="flex items-center gap-4 px-5 py-4 md:px-6">
          <div className="h-11 w-11 shrink-0 rounded-lg bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-40 rounded bg-muted" />
            <div className="h-3 w-56 rounded bg-muted" />
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
    <div className="ui-panel ui-panel-interactive overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between md:px-6">
        <div className="flex items-center gap-3">
          <span className="ui-icon-box h-10 w-10">
            <ListOrdered className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden />
          </span>
          <div>
            <h3 className="text-[17px] font-bold text-foreground">Resultados</h3>
            <p className="mt-1 text-[13px] text-muted-foreground">
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
                  <tr className="border-b border-border bg-muted">
                    {["#", "Veículo", "Placa", "Cliente", "Data", "Status", ""].map((header) => (
                      <th
                        key={header || "action"}
                        className={cn(
                          "ui-microlabel px-5 py-3.5 text-left md:px-6",
                          header === "" && "w-10",
                        )}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {inspections.map((inspection) => (
                    <tr
                      key={inspection.id}
                      className="group transition-colors duration-150 hover:bg-brand-subtle"
                    >
                      <td className="px-5 py-4 md:px-6">
                        <span className="ui-icon-box ui-metric h-9 min-h-0 min-w-9 text-xs font-bold">
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
                          className="inline-flex h-9 min-h-0 min-w-9 items-center justify-center rounded-lg text-muted-foreground opacity-0 transition-opacity duration-150 hover:text-primary group-hover:opacity-100"
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

          <div className="divide-y divide-border lg:hidden">
            {inspections.map((inspection) => (
              <InspectionRow key={inspection.id} inspection={inspection} />
            ))}
          </div>
        </>
      )}

      {!isLoading && inspections.length > 0 && (
        <div className="flex items-center gap-2 border-t border-border bg-muted px-5 py-3 text-[11px] text-muted-foreground md:px-6">
          <FileSearch className="h-3.5 w-3.5 shrink-0" />
          <span>
            Os arquivos exportados incluem marca, modelo e demais campos do laudo.
          </span>
        </div>
      )}
    </div>
  );
}
