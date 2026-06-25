import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import type { Inspection } from "@/services/inspection-service";
import { VistoriaStatusBadge } from "@/components/vistoria/vistoria-status-badge";
import { VistoriaActionsMenu } from "@/components/vistoria/vistoria-actions-menu";
import { formatDate } from "@/lib/formatters";
import { ROUTES } from "@/lib/constants";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function VistoriaCard({ inspection }: { inspection: Inspection }) {
  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-elevated">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-accent/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <Link
            to={ROUTES.inspection(inspection.id)}
            className="min-w-0 text-base font-semibold leading-none tracking-tight group-hover:text-primary"
          >
            #{inspection.inspection_number}, {inspection.plate}
          </Link>
          <div className="flex shrink-0 items-center gap-0.5">
            <VistoriaStatusBadge status={inspection.status} />
            <VistoriaActionsMenu
              inspection={inspection}
              triggerClassName="h-7 w-7 opacity-60 hover:opacity-100"
            />
          </div>
        </div>
      </CardHeader>
      <Link to={ROUTES.inspection(inspection.id)} className="block">
        <CardContent className="space-y-1 text-sm text-muted-foreground">
          <p>
            {inspection.brand} {inspection.model}
          </p>
          <p>{inspection.client_name}</p>
          <div className="flex items-center justify-between pt-2">
            <p className="text-xs">{formatDate(inspection.inspection_date)}</p>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 transition-all group-hover:opacity-100 group-hover:text-primary" />
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
