import type { Inspection } from "@/services/inspection-service";
import type { ChecklistItem } from "@/services/checklist-service";
import type { InspectionPhoto } from "@/services/photo-service";
import { validateChecklistCompletion } from "@/components/forms/checklist-form";
import {
  isPlaceholderDraftValue,
  WIZARD_REQUIRED_DRAFT_FIELDS,
} from "@/features/draft/lib/draft-defaults";
import { computeCaptureProgress } from "@/lib/photos/photo-progress";
import { PHOTO_REQUIREMENTS_ENABLED } from "@/lib/photos/photo-requirements-flag";
import { getOpinionLabel, summarizeLaudoChecklist } from "@/lib/laudo/laudo-model";
import { formatPlate } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  Camera,
  Car,
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

function validateDadosReadiness(inspection: Inspection): { ok: boolean; description: string } {
  const missingLabels = WIZARD_REQUIRED_DRAFT_FIELDS.filter(({ field }) =>
    isPlaceholderDraftValue(field, inspection[field as keyof Inspection]),
  ).map(({ label }) => label);

  if (!inspection.inspection_type_id?.trim()) {
    missingLabels.push("Tipo de vistoria");
  }

  if (missingLabels.length === 0) {
    return { ok: true, description: "Dados do contratante e veículo preenchidos." };
  }

  if (missingLabels.length === 1) {
    return { ok: false, description: `Preencha: ${missingLabels[0]}.` };
  }

  return {
    ok: false,
    description: `${missingLabels.length} campo(s) pendente(s) na avaliação técnica.`,
  };
}

export function buildLaudoReadiness(
  inspection: Inspection,
  checklist: ChecklistItem[],
  photos: InspectionPhoto[],
): LaudoReadinessItem[] {
  const dadosStatus = validateDadosReadiness(inspection);
  const checklistStatus = validateChecklistCompletion(checklist);
  const stats = summarizeLaudoChecklist(checklist);
  const photoProgress = computeCaptureProgress(photos);
  const hasOpinion = Boolean(inspection.opinion?.trim());
  const technicalNotes = inspection.technical_notes?.trim() ?? "";
  const hasTechnicalNotes = technicalNotes.length >= 10;

  const items: LaudoReadinessItem[] = [
    {
      id: "dados",
      title: "Dados da vistoria",
      description: dadosStatus.description,
      ok: dadosStatus.ok,
    },
    {
      id: "photos",
      title: PHOTO_REQUIREMENTS_ENABLED ? "Fotografias" : "Fotos",
      description: PHOTO_REQUIREMENTS_ENABLED
        ? photoProgress.canProceed
          ? `${photoProgress.totalCompleted}/${photoProgress.totalRequired} obrigatórias concluídas.`
          : `${photoProgress.missingRequiredLabels.length} foto(s) obrigatória(s) pendente(s).`
        : `${photos.length} foto(s) registrada(s).`,
      ok: PHOTO_REQUIREMENTS_ENABLED ? photoProgress.canProceed : photos.length > 0,
    },
    {
      id: "checklist",
      title: "Checklist técnico",
      description:
        checklistStatus.pendingCount > 0
          ? `${checklistStatus.pendingCount} item(ns) pendente(s).`
          : checklistStatus.missingNotesCount > 0
            ? `${checklistStatus.missingNotesCount} apontamento(s) sem observação.`
            : `${stats.evaluated}/${stats.total} itens · ${stats.naoConforme} apontamento(s).`,
      ok: checklistStatus.valid,
    },
    {
      id: "opinion",
      title: "Parecer técnico",
      description: hasOpinion
        ? getOpinionLabel(inspection.opinion)
        : "Selecione o parecer na avaliação técnica.",
      ok: hasOpinion,
    },
    {
      id: "notes",
      title: "Observações técnicas",
      description: hasTechnicalNotes
        ? "Registradas e incluídas no laudo."
        : technicalNotes.length > 0
          ? "Descreva pelo menos 10 caracteres nas observações técnicas."
          : "Descreva as observações na avaliação técnica.",
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
    <div
      className={cn(
        "rounded-xl border border-border bg-card px-3.5 py-3 shadow-soft sm:px-4 sm:py-3.5",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground">
            {isReady ? "Pronto para emitir" : "Pendências encontradas"}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            #{inspection.inspection_number} · {formatPlate(inspection.plate)}
          </p>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold",
            isReady ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800",
          )}
        >
          {readyCount}/{items.length}
        </span>
      </div>
      <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            isReady ? "bg-emerald-500" : "bg-primary",
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

const READINESS_ICONS: Record<string, typeof CheckCircle2> = {
  dados: Car,
  checklist: ClipboardList,
  photos: Camera,
  opinion: Scale,
  notes: FileText,
};

interface LaudoReadinessListProps {
  items: LaudoReadinessItem[];
  onFix?: (itemId: string) => void;
  compact?: boolean;
}

export function LaudoReadinessList({ items, onFix, compact = false }: LaudoReadinessListProps) {
  return (
    <ul className={cn(compact ? "space-y-1.5" : "space-y-2")}>
      {items.map((item) => {
        const Icon = READINESS_ICONS[item.id] ?? FileText;
        return (
          <li
            key={item.id}
            className={cn(
              "flex items-center gap-2.5 rounded-lg border px-2.5 py-2 sm:gap-3 sm:px-3 sm:py-2.5",
              item.ok
                ? "border-emerald-200/70 bg-emerald-50/30"
                : "border-amber-200/70 bg-amber-50/30",
            )}
          >
            <span
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-md",
                item.ok ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800",
              )}
            >
              {item.ok ? (
                <CheckCircle2 className="size-3.5" strokeWidth={2.5} />
              ) : (
                <AlertTriangle className="size-3.5" strokeWidth={2.5} />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <Icon className="size-3 shrink-0 text-muted-foreground" aria-hidden />
                <p className="truncate text-xs font-semibold sm:text-sm">{item.title}</p>
              </div>
              <p className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">
                {item.description}
              </p>
            </div>
            {!item.ok && onFix && (
              <button
                type="button"
                onClick={() => onFix(item.id)}
                className="shrink-0 rounded-md px-2 py-1 text-[11px] font-semibold text-primary hover:bg-primary/5"
              >
                Corrigir
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export function getMissingPhotoLabels(photos: InspectionPhoto[]): string[] {
  return computeCaptureProgress(photos).missingRequiredLabels;
}
