import { Link, useParams } from "react-router-dom";
import { useInspection } from "@/hooks/use-inspection";
import { VistoriaStatusBadge } from "@/components/vistoria/vistoria-status-badge";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/lib/formatters";
import { Camera, ClipboardList, Edit, FileText } from "lucide-react";

export function Page() {
  const { id } = useParams<{ id: string }>();
  const { data: inspection, isLoading, error } = useInspection(id);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !inspection) {
    return <p className="text-destructive">Vistoria não encontrada.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">
              Vistoria #{inspection.inspection_number}
            </h1>
            <VistoriaStatusBadge status={inspection.status} />
          </div>
          <p className="text-muted-foreground">{inspection.plate} — {inspection.brand} {inspection.model}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to={`/vistorias/${id}/editar`}><Edit className="h-4 w-4" />Editar</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to={`/vistorias/${id}/checklist`}><ClipboardList className="h-4 w-4" />Checklist</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to={`/vistorias/${id}/fotos`}><Camera className="h-4 w-4" />Fotos</Link>
          </Button>
          <Button asChild size="sm">
            <Link to={`/vistorias/${id}/laudo`}><FileText className="h-4 w-4" />Laudo</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Cliente</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p>{inspection.client_name}</p>
            <p>{inspection.client_document}</p>
            <p>{inspection.client_phone ?? "—"}</p>
            <p>{inspection.client_email ?? "—"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Veículo</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p>Chassi: {inspection.chassis}</p>
            <p>Cor: {inspection.color} · {inspection.fuel}</p>
            <p>Ano: {inspection.manufacture_year}/{inspection.model_year}</p>
            <p>KM: {inspection.mileage ?? "—"}</p>
            <p>Situação: {inspection.situation.replace(/_/g, " ")}</p>
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader><CardTitle>Identificação</CardTitle></CardHeader>
          <CardContent className="text-sm">
            <p>{formatDate(inspection.inspection_date)} às {inspection.inspection_time.slice(0, 5)}</p>
            <p>{inspection.location}</p>
            {inspection.technical_notes && (
              <p className="mt-3 text-muted-foreground">{inspection.technical_notes}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
