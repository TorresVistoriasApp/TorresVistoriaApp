import type { Inspection } from "@/services/inspection-service";
import type { ChecklistItem } from "@/services/checklist-service";
import type { InspectionPhoto } from "@/services/photo-service";
import type { LaudoCompany, LaudoInspector, LaudoSettings } from "@/lib/laudo/laudo-model";
import { getOpinionLabel, summarizeLaudoChecklist } from "@/lib/laudo/laudo-model";
import { formatDate, formatDocument, formatKM, formatPlate, getDocumentTypeLabel } from "@/lib/formatters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getBrandLogoPath } from "@/lib/vehicle-brand-logos";

export function LaudoTemplate({
  inspection,
  checklist,
  photos = [],
  company,
  inspector,
}: {
  inspection: Inspection;
  checklist: ChecklistItem[];
  photos?: InspectionPhoto[];
  company?: LaudoCompany | null;
  settings?: LaudoSettings | null;
  inspector?: LaudoInspector | null;
}) {
  const stats = summarizeLaudoChecklist(checklist);
  const opinion = getOpinionLabel(inspection.opinion);
  const firstPhoto = photos.find((photo) => photo.public_url)?.public_url;
  const brandLogoPath = getBrandLogoPath(inspection.brand);

  return (
    <Card className="overflow-hidden border-2">
      <CardHeader className="border-b bg-gradient-to-r from-primary/10 to-transparent">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Torres Vistorias
            </p>
            <CardTitle className="mt-1">Laudo #{inspection.inspection_number}</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              {company?.name ?? "Empresa vistoriadora"} · {formatDate(inspection.inspection_date)}
            </p>
            {company?.document && (
              <p className="text-xs text-muted-foreground">
                {getDocumentTypeLabel(company.document)}: {formatDocument(company.document)}
              </p>
            )}
          </div>
          <span
            className={cn(
              "rounded-full px-3 py-1 text-xs font-bold uppercase",
              opinion.includes("REPROVADO")
                ? "bg-destructive text-destructive-foreground"
                : opinion.includes("APONTAMENTO")
                  ? "bg-orange-100 text-orange-800"
                  : "bg-emerald-100 text-emerald-800",
            )}
          >
            {opinion}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        {firstPhoto && (
          <div className="-mx-6 border-b">
            <img src={firstPhoto} alt="Foto principal da vistoria" className="h-52 w-full object-cover" />
          </div>
        )}

        <div className="flex gap-4">
          <div className="flex w-24 shrink-0 flex-col items-center justify-center rounded-lg border-2 border-foreground/80 bg-muted/30 p-3">
            {brandLogoPath ? (
              <img
                src={brandLogoPath}
                alt={`Logo ${inspection.brand}`}
                className="h-10 w-full object-contain"
              />
            ) : (
              <p className="text-center text-sm font-bold">{inspection.brand}</p>
            )}
            <p className="mt-2 text-[10px] uppercase tracking-wide text-muted-foreground">
              Marca do veículo
            </p>
          </div>

          <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-3">
          <div>
            <p className="text-xs text-muted-foreground">Placa</p>
            <p className="font-mono text-lg font-bold">{formatPlate(inspection.plate)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Checklist</p>
            <p className="font-bold">
              {stats.evaluated}/{stats.total}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Não conforme</p>
            <p className="font-bold text-destructive">{stats.naoConforme}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Fotos</p>
            <p className="font-bold">{photos.length}</p>
          </div>
          <div className="col-span-2 sm:col-span-4">
            <p className="text-xs text-muted-foreground">Veículo</p>
            <p className="font-medium">
              {inspection.brand} {inspection.model} · {inspection.color} · {inspection.manufacture_year}/
              {inspection.model_year} · {formatKM(inspection.mileage)}
            </p>
          </div>
          <div className="col-span-2 sm:col-span-3">
            <p className="text-xs text-muted-foreground">Cliente</p>
            <p className="font-medium">{inspection.client_name}</p>
          </div>
          </div>
        </div>

        <div className="rounded-lg border bg-muted/30 p-3">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Dados da vistoria</p>
          <div className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
            <p>
              <span className="text-muted-foreground">Vistoriador:</span>{" "}
              <span className="font-medium">{inspector?.full_name ?? "Não informado"}</span>
            </p>
            <p>
              <span className="text-muted-foreground">Local:</span>{" "}
              <span className="font-medium">{inspection.location}</span>
            </p>
            {company?.address && (
              <p className="sm:col-span-2">
                <span className="text-muted-foreground">Endereço da empresa:</span>{" "}
                <span className="font-medium">{company.address}</span>
              </p>
            )}
          </div>
        </div>

        <div className="rounded-lg border bg-muted/30 p-3">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Parecer técnico</p>
          <p className="mt-1 text-sm leading-relaxed">
            {inspection.technical_notes || "Sem observações técnicas complementares."}
          </p>
        </div>

        <p className="text-xs text-muted-foreground">
          Vistoriador: {inspector?.full_name ?? "não informado"} · Laudo com fotos, checklist técnico,
          resumo gráfico, QR de validação e rodapé jurídico no PDF final.
        </p>
      </CardContent>
    </Card>
  );
}
