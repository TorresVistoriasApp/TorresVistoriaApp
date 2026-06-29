import type { Inspection } from "@/services/inspection-service";
import type { ChecklistItem } from "@/services/checklist-service";
import type { InspectionPhoto } from "@/services/photo-service";
import { validateChecklistCompletion } from "@/components/forms/checklist-form";
import { computeCaptureProgress } from "@/lib/photos/photo-progress";
import { getOpinionLabel, summarizeLaudoChecklist } from "@/lib/laudo/laudo-model";
import { formatPlate } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  ClipboardList,
  FileText,
  Scale,
} from "lucide-react";

export type LaudoReadinessItem = {
  id: string;
  title: string;
  description: string;
  ok: boolean;
};

export function buildLaudoReadiness(
  inspection: Inspection,
  checklist: ChecklistItem[],
  photos: InspectionPhoto[],
): LaudoReadinessItem[] {
  const checklistStatus = validateChecklistCompletion(checklist);
  const stats = summarizeLaudoChecklist(checklist);
  const photoProgress = computeCaptureProgress(photos);
  const hasOpinion = Boolean(inspection.opinion?.trim());
  const hasTechnicalNotes = Boolean(inspection.technical_notes?.trim());

  const items: LaudoReadinessItem[] = [
    {
      id: "checklist",
      title: "Checklist técnico",
      description:
        checklistStatus.pendingCount > 0
          ? `${checklistStatus.pendingCount} item(ns) ainda pendente(s).`
          : checklistStatus.missingNotesCount > 0
            ? `${checklistStatus.missingNotesCount} item(ns) com ressalvas sem observação.`
            : `${stats.evaluated}/${stats.total} itens avaliados, ${stats.naoConforme} com ressalvas.`,
      ok: checklistStatus.valid,
    },
    {
      id: "photos",
      title: "Fotos obrigatórias",
      description: photoProgress.canProceed
        ? `${photos.length} foto(s) registrada(s). ${photoProgress.totalCompleted}/${photoProgress.totalRequired} obrigatórias concluídas.`
        : `Faltam ${photoProgress.missingRequiredLabels.length} fotografia(s) obrigatória(s) em ${12 - photoProgress.sections.filter((s) => s.status === "COMPLETED").length} seção(ões).`,
      ok: photoProgress.canProceed,
    },
    {
      id: "opinion",
      title: "Parecer técnico",
      description: hasOpinion
        ? getOpinionLabel(inspection.opinion)
        : "Selecione o parecer na etapa de dados da vistoria.",
      ok: hasOpinion,
    },
    {
      id: "notes",
      title: "Observações técnicas",
      description: hasTechnicalNotes
        ? "Observações registradas e incluídas no laudo."
        : "Descreva as observações técnicas na etapa de dados.",
      ok: hasTechnicalNotes,
    },
  ];

  return items;
}

export function getLaudoBlockerMessages(items: LaudoReadinessItem[]): string[] {
  return items.filter((item) => !item.ok).map((item) => `${item.title}: ${item.description}`);
}

interface LaudoReadinessSummaryProps {
  inspection: Inspection;
  items: LaudoReadinessItem[];
  className?: string;
}

export function LaudoReadinessSummary({
  inspection,
  items,
  className,
}: LaudoReadinessSummaryProps) {
  const readyCount = items.filter((item) => item.ok).length;
  const isReady = readyCount === items.length;
  const progress = Math.round((readyCount / items.length) * 100);

  return (
    <div className={cn("rounded-xl border border-border bg-card p-4 shadow-soft sm:p-5", className)}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-semibold text-foreground">
            {isReady ? "Pronto para emitir o laudo" : "Revise os itens abaixo"}
          </p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Vistoria #{inspection.inspection_number}, placa {formatPlate(inspection.plate)}.
            {isReady
              ? " Todos os requisitos foram atendidos."
              : " Corrija as pendências antes de gerar o PDF."}
          </p>
        </div>
        <span
          className={cn(
            "rounded-full px-3 py-1 text-xs font-semibold",
            isReady ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800",
          )}
        >
          {readyCount}/{items.length} ok
        </span>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            isReady ? "bg-emerald-500" : "gradient-primary",
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

const READINESS_ICONS: Record<string, typeof CheckCircle2> = {
  checklist: ClipboardList,
  photos: Camera,
  opinion: Scale,
  notes: FileText,
};

interface LaudoReadinessListProps {
  items: LaudoReadinessItem[];
  onFix?: (itemId: string) => void;
}

export function LaudoReadinessList({ items, onFix }: LaudoReadinessListProps) {
  return (
    <ul className="space-y-2">
      {items.map((item) => {
        const Icon = READINESS_ICONS[item.id] ?? FileText;
        return (
          <li
            key={item.id}
            className={cn(
              "flex items-start gap-3 rounded-xl border px-3 py-3 sm:px-4",
              item.ok
                ? "border-emerald-200/80 bg-emerald-50/40"
                : "border-amber-200/80 bg-amber-50/40",
            )}
          >
            <span
              className={cn(
                "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg",
                item.ok ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800",
              )}
            >
              {item.ok ? (
                <CheckCircle2 className="size-4" strokeWidth={2.5} />
              ) : (
                <AlertTriangle className="size-4" strokeWidth={2.5} />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Icon className="size-3.5 text-muted-foreground" aria-hidden />
                <p className="text-sm font-semibold leading-tight">{item.title}</p>
              </div>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                {item.description}
              </p>
              {!item.ok && onFix && (
                <button
                  type="button"
                  onClick={() => onFix(item.id)}
                  className="mt-2 text-xs font-semibold text-primary underline-offset-2 hover:underline"
                >
                  Ir corrigir
                </button>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function getMissingPhotoLabels(photos: InspectionPhoto[]): string[] {
  return computeCaptureProgress(photos).missingRequiredLabels;
}
