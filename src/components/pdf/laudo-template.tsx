import type { Inspection } from "@/services/inspection-service";
import type { ChecklistItem } from "@/services/checklist-service";
import { formatDate, formatPlate } from "@/lib/formatters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function LaudoTemplate({
  inspection,
  checklist,
}: {
  inspection: Inspection;
  checklist: ChecklistItem[];
}) {
  const naoConforme = checklist.filter((i) => i.status === "NAO_CONFORME").length;

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle>Laudo #{inspection.inspection_number}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-muted-foreground">Data</p>
            <p className="font-medium">{formatDate(inspection.inspection_date)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Placa</p>
            <p className="font-medium">{formatPlate(inspection.plate)}</p>
          </div>
          <div className="col-span-2">
            <p className="text-xs text-muted-foreground">Veículo</p>
            <p className="font-medium">
              {inspection.brand} {inspection.model}
            </p>
          </div>
          <div className="col-span-2">
            <p className="text-xs text-muted-foreground">Cliente</p>
            <p className="font-medium">{inspection.client_name}</p>
          </div>
        </div>
        {inspection.opinion && (
          <div className="rounded-lg border bg-muted/30 p-3 text-center">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Parecer</p>
            <p className="mt-1 text-lg font-bold">{inspection.opinion.replace(/_/g, " ")}</p>
          </div>
        )}
        <p className="text-muted-foreground">
          {checklist.length} itens · {naoConforme} não conforme
          {inspection.technical_notes ? " · Com observações técnicas" : ""}
        </p>
      </CardContent>
    </Card>
  );
}
