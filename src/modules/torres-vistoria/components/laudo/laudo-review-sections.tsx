import type { Inspection } from "@/modules/torres-vistoria/services/inspection-service";
import type { ChecklistItem } from "@/modules/torres-vistoria/services/checklist-service";
import type { InspectionPhoto } from "@/modules/torres-vistoria/services/photo-service";
import { summarizeLaudoChecklist, getOpinionLabel } from "@/modules/torres-vistoria/domain/laudo/laudo-model";
import { formatDate, formatDocument, formatPlate } from "@/shared/lib/formatters";
import { hasLaudoValue } from "@/modules/torres-vistoria/domain/laudo/laudo-field-utils";
import { cn } from "@/shared/lib/utils";

export function LaudoDataSummary({ inspection }: { inspection: Inspection }) {
  const rows = [
    { label: "Data", value: formatDate(inspection.inspection_date) },
    { label: "Local", value: inspection.location },
    { label: "Contratante", value: inspection.client_name },
    {
      label: "Documento",
      value: hasLaudoValue(inspection.client_document)
        ? formatDocument(inspection.client_document)
        : null,
    },
    {
      label: "Veículo",
      value: `${formatPlate(inspection.plate)} · ${inspection.brand} ${inspection.model}`,
    },
    {
      label: "Ano",
      value: `${inspection.manufacture_year}/${inspection.model_year}`,
    },
  ].filter((row) => row.value);

  return (
    <dl className="grid grid-cols-1 gap-2 sm:grid-cols-2">
      {rows.map((row) => (
        <div key={row.label} className="rounded-lg bg-muted/25 px-3 py-2">
          <dt className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            {row.label}
          </dt>
          <dd className="mt-0.5 text-sm font-medium leading-snug text-foreground">{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function LaudoPhotosGrid({
  photos,
  onViewAll,
}: {
  photos: InspectionPhoto[];
  onViewAll?: () => void;
}) {
  if (photos.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-muted-foreground">Nenhuma foto registrada.</p>
    );
  }

  const preview = photos.slice(0, 6);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-6 sm:gap-2">
        {preview.map((photo) => (
          <div
            key={photo.id}
            className="aspect-square overflow-hidden rounded-lg border border-border/60 bg-muted"
          >
            {photo.public_url ? (
              <img
                src={photo.public_url}
                alt={photo.category}
                className="size-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="flex size-full items-center justify-center text-[10px] text-muted-foreground">
                {photo.category}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>{photos.length} foto(s) na vistoria</span>
        {onViewAll && photos.length > 6 && (
          <button
            type="button"
            onClick={onViewAll}
            className="font-semibold text-primary hover:underline"
          >
            Ver todas
          </button>
        )}
      </div>
    </div>
  );
}

export function LaudoChecklistSummary({
  inspection,
  checklist,
}: {
  inspection: Inspection;
  checklist: ChecklistItem[];
}) {
  const stats = summarizeLaudoChecklist(checklist);
  const opinion = inspection.opinion ? getOpinionLabel(inspection.opinion) : null;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <StatPill label="Avaliados" value={`${stats.evaluated}/${stats.total}`} />
        <StatPill
          label="Apontamentos"
          value={String(stats.naoConforme)}
          tone={stats.naoConforme > 0 ? "warning" : "default"}
        />
        <StatPill label="Pendentes" value={String(stats.pendente)} tone={stats.pendente > 0 ? "warning" : "default"} />
      </div>
      {opinion && (
        <div className="rounded-lg border border-border/60 bg-muted/20 px-3 py-2.5">
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Parecer
          </p>
          <p className="mt-0.5 text-sm font-semibold text-foreground">{opinion}</p>
          {inspection.technical_notes && (
            <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
              {inspection.technical_notes}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function StatPill({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "warning";
}) {
  return (
    <div
      className={cn(
        "rounded-lg px-2 py-2 text-center",
        tone === "warning" ? "bg-amber-50 text-amber-900" : "bg-muted/30 text-foreground",
      )}
    >
      <p className="text-[10px] font-medium text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-bold tabular-nums">{value}</p>
    </div>
  );
}
