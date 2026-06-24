import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import type { Inspection } from "@/services/inspection-service";
import { VistoriaStatusBadge } from "@/components/vistoria/vistoria-status-badge";
import { formatDate } from "@/lib/formatters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function VistoriaCard({ inspection }: { inspection: Inspection }) {
  return (
    <Link to={`/vistorias/${inspection.id}`} className="group block">
      <Card className="relative overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-elevated">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-accent/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base group-hover:text-primary">
              #{inspection.inspection_number} — {inspection.plate}
            </CardTitle>
            <VistoriaStatusBadge status={inspection.status} />
          </div>
        </CardHeader>
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
      </Card>
    </Link>
  );
}
