import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { ROUTES } from "@/config/routes";
import { cn } from "@/shared/lib/utils";
import { formatDateTime } from "@/shared/lib/formatters";
import { EmptyState } from "@/shared/components/empty-state";
import { getQueryLabel } from "@/modules/torres-consulta/domain/query-catalog";
import {
  formatPlate,
  maskChassisForDisplay,
} from "@/modules/torres-consulta/utils/vehicle-identifier";
import { ConsultaStatus, type Consulta } from "@/modules/torres-consulta/types/consulta";

const STATUS_STYLES: Record<ConsultaStatus, { label: string; className: string }> = {
  [ConsultaStatus.PROCESSING]: {
    label: "Processando",
    className: "bg-amber-500/10 text-amber-700",
  },
  [ConsultaStatus.COMPLETED]: {
    label: "Concluída",
    className: "bg-emerald-500/10 text-emerald-700",
  },
  [ConsultaStatus.FAILED]: {
    label: "Falhou",
    className: "bg-destructive/10 text-destructive",
  },
};

export function ConsultaHistoryList({ consultas }: { consultas: Consulta[] }) {
  if (consultas.length === 0) {
    return (
      <EmptyState
        title="Nenhuma consulta ainda"
        description="As consultas realizadas pela sua equipe aparecem aqui."
      />
    );
  }

  return (
    <ul className="space-y-2">
      {consultas.map((consulta) => {
        const status = STATUS_STYLES[consulta.status];
        return (
          <li key={consulta.id}>
            <Link
              to={ROUTES.consultaDetail(consulta.id)}
              className="flex items-center gap-4 rounded-xl border border-border bg-card px-4 py-3 shadow-soft transition-colors hover:border-primary/30 hover:bg-primary/5"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-mono text-sm font-semibold tracking-wider">
                  {consulta.plate
                    ? formatPlate(consulta.plate)
                    : maskChassisForDisplay(consulta.chassis ?? "")}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {getQueryLabel(consulta.type)} · {formatDateTime(consulta.createdAt)}
                </p>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                  status.className,
                )}
              >
                {status.label}
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
