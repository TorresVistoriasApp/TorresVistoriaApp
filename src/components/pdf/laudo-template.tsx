import type { Inspection } from "@/services/inspection-service";
import type { ChecklistItem } from "@/services/checklist-service";
import type { InspectionPhoto } from "@/services/photo-service";
import type { LaudoCompany, LaudoInspector, LaudoSettings } from "@/lib/laudo/laudo-model";
import { getOpinionLabel, summarizeLaudoChecklist } from "@/lib/laudo/laudo-model";
import { getChecklistStatusLabel } from "@/lib/checklist-status";
import { ChecklistStatus } from "@/lib/enums";
import { formatDate, formatDocument, formatKM, formatPlate, getDocumentTypeLabel } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { getBrandLogoPath } from "@/lib/vehicle-brand-logos";

export function LaudoTemplate({
  inspection,
  checklist,
  photos = [],
  company,
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

  const opinionTone = opinion.includes("REPROVADO")
    ? "bg-destructive text-destructive-foreground"
    : opinion.includes("APONTAMENTO")
      ? "bg-orange-100 text-orange-800"
      : "bg-emerald-100 text-emerald-800";

  return (
    <article className="overflow-hidden rounded-xl border-2 border-border bg-card shadow-sm">
      <header className="border-b bg-gradient-to-r from-primary/10 via-primary/5 to-transparent px-4 py-4 sm:px-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">
              Torres Vistorias
            </p>
            <h2 className="mt-1 text-lg font-bold tracking-tight sm:text-xl">
              Laudo #{inspection.inspection_number}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {company?.name ?? "Empresa vistoriadora"}, {formatDate(inspection.inspection_date)}
            </p>
            {company?.document && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                {getDocumentTypeLabel(company.document)}: {formatDocument(company.document)}
              </p>
            )}
          </div>
          <span
            className={cn(
              "inline-flex w-fit shrink-0 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide",
              opinionTone,
            )}
          >
            {opinion}
          </span>
        </div>
      </header>

      <div className="space-y-4 p-4 text-sm sm:p-5">
        {firstPhoto && (
          <div className="-mx-4 overflow-hidden border-y border-border sm:-mx-5">
            <img
              src={firstPhoto}
              alt="Foto principal da vistoria"
              className="h-44 w-full object-cover sm:h-52"
            />
          </div>
        )}

        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="flex w-full shrink-0 flex-col items-center justify-center rounded-xl border-2 border-foreground/15 bg-muted/30 p-3 sm:w-24">
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

          <dl className="grid flex-1 grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
            <div>
              <dt className="text-xs text-muted-foreground">Placa</dt>
              <dd className="font-mono text-lg font-bold">{formatPlate(inspection.plate)}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Checklist</dt>
              <dd className="font-bold">
                {stats.evaluated}/{stats.total}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">
                {getChecklistStatusLabel(ChecklistStatus.NAO_CONFORME)}
              </dt>
              <dd className="font-bold text-amber-700">{stats.naoConforme}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Fotos</dt>
              <dd className="font-bold">{photos.length}</dd>
            </div>
            <div className="col-span-2 sm:col-span-3">
              <dt className="text-xs text-muted-foreground">Veículo</dt>
              <dd className="font-medium leading-snug">
                {inspection.brand} {inspection.model}, {inspection.color},{" "}
                {inspection.manufacture_year}/{inspection.model_year}, {formatKM(inspection.mileage)}
              </dd>
            </div>
            <div className="col-span-2 sm:col-span-3">
              <dt className="text-xs text-muted-foreground">Cliente</dt>
              <dd className="font-medium">{inspection.client_name}</dd>
            </div>
          </dl>
        </div>

        <section className="rounded-xl border bg-muted/30 p-3 sm:p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Dados da vistoria
          </h3>
          <dl className="mt-2 grid gap-2 sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Empresa</dt>
              <dd className="font-medium">{company?.name ?? "Não informado"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Local</dt>
              <dd className="font-medium">{inspection.location}</dd>
            </div>
            {company?.address && (
              <div className="sm:col-span-2">
                <dt className="text-muted-foreground">Endereço da empresa</dt>
                <dd className="font-medium">{company.address}</dd>
              </div>
            )}
          </dl>
        </section>

        <section className="rounded-xl border bg-muted/30 p-3 sm:p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Parecer técnico
          </h3>
          <p className="mt-2 text-sm leading-relaxed">
            {inspection.technical_notes || "Sem observações técnicas complementares."}
          </p>
        </section>

        <p className="text-xs leading-relaxed text-muted-foreground">
          Empresa: {company?.name ?? "não informada"}. O PDF final inclui fotos, checklist técnico,
          resumo gráfico, QR de validação e rodapé jurídico.
        </p>
      </div>
    </article>
  );
}
