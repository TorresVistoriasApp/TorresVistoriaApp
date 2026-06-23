import { Link } from "react-router-dom";
import type { Inspection } from "@/services/inspection-service";
import { VistoriaStatusBadge } from "@/components/vistoria/vistoria-status-badge";
import { formatDate } from "@/lib/formatters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function VistoriaCard({ inspection }: { inspection: Inspection }) {
  return (
    <Link to={`/vistorias/${inspection.id}`}>
      <Card className="transition-shadow hover:shadow-md">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base">
              #{inspection.inspection_number} — {inspection.plate}
            </CardTitle>
            <VistoriaStatusBadge status={inspection.status} />
          </div>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>{inspection.brand} {inspection.model}</p>
          <p>{inspection.client_name}</p>
          <p>{formatDate(inspection.inspection_date)}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
