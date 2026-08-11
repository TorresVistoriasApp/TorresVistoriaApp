import { useEffect, useMemo, useState } from "react";
import type { ChecklistItem } from "@/modules/torres-vistoria/services/checklist-service";
import { ChecklistStatus } from "@/modules/torres-vistoria/domain/enums";
import { getChecklistItemCriteria } from "@/modules/torres-vistoria/domain/checklist/checklist-catalog";
import { getChecklistStatusMeta } from "@/modules/torres-vistoria/domain/checklist/checklist-status";
import {
  formatChecklistIssueNotes,
  getChecklistIssueOptions,
  parseChecklistIssueNotes,
} from "@/modules/torres-vistoria/domain/checklist/checklist-issue-options";
import { ChecklistStatusToggle } from "@/modules/torres-vistoria/components/checklist/checklist-status-toggle";
import { ChecklistIssuePicker } from "@/modules/torres-vistoria/components/checklist/checklist-issue-picker";
import { cn } from "@/shared/lib/utils";
import { ChevronDown, MessageSquarePlus } from "lucide-react";

type ChecklistItemProps = {
  item: ChecklistItem;
  index: number;
  disabled?: boolean;
  onUpdate: (id: string, status: string, notes?: string) => void;
};

export function ChecklistItemRow({ item, index, disabled, onUpdate }: ChecklistItemProps) {
  const criteria = getChecklistItemCriteria(item.category, item.item_name);
  const options = useMemo(
    () => getChecklistIssueOptions(item.category, item.item_name),
    [item.category, item.item_name],
  );
  const parsed = useMemo(
    () => parseChecklistIssueNotes(item.category, item.item_name, item.notes),
    [item.category, item.item_name, item.notes],
  );

  const [issueCodes, setIssueCodes] = useState<string[]>(parsed.issueCodes);
  const [manualObservation, setManualObservation] = useState(parsed.manualObservation);
  const [showOptionalNotes, setShowOptionalNotes] = useState(
    () =>
      !!item.notes?.trim() &&
      item.status !== ChecklistStatus.CONFORME &&
      item.status !== ChecklistStatus.PENDENTE &&
      item.status !== ChecklistStatus.NAO_CONFORME,
  );

  const isPending = item.status === ChecklistStatus.PENDENTE;
  const isNonConform = item.status === ChecklistStatus.NAO_CONFORME;
  const isEvaluated = !isPending;
  const persistedNotes = formatChecklistIssueNotes(
    item.category,
    item.item_name,
    issueCodes,
    manualObservation,
  );
  const needsIssue = isNonConform && !persistedNotes;
  const ressalvasMeta = getChecklistStatusMeta(ChecklistStatus.NAO_CONFORME);
  const pendingMeta = getChecklistStatusMeta(ChecklistStatus.PENDENTE);

  useEffect(() => {
    const next = parseChecklistIssueNotes(item.category, item.item_name, item.notes);
    setIssueCodes(next.issueCodes);
    setManualObservation(next.manualObservation);
  }, [item.category, item.item_name, item.notes]);

  const persist = (status: string, codes: readonly string[], manual: string) => {
    const notes = formatChecklistIssueNotes(item.category, item.item_name, codes, manual);
    onUpdate(item.id, status, notes ?? undefined);
  };

  const handleStatusChange = (status: string) => {
    if (status === ChecklistStatus.NAO_CONFORME) {
      setShowOptionalNotes(false);
      persist(status, issueCodes, manualObservation);
      return;
    }

    if (status === ChecklistStatus.PENDENTE) {
      setIssueCodes([]);
      setManualObservation("");
      setShowOptionalNotes(false);
      onUpdate(item.id, status, undefined);
      return;
    }

    // Aprovado / Não avaliado: limpa apontamentos rápidos
    setIssueCodes([]);
    setManualObservation("");
    if (!showOptionalNotes) {
      onUpdate(item.id, status, undefined);
    } else {
      onUpdate(item.id, status, manualObservation.trim() || undefined);
    }
  };

  const handleToggleCode = (code: string) => {
    const next = issueCodes.includes(code)
      ? issueCodes.filter((c) => c !== code)
      : [...issueCodes, code];
    setIssueCodes(next);
    persist(ChecklistStatus.NAO_CONFORME, next, manualObservation);
  };

  const handleManualBlur = () => {
    const trimmed = manualObservation.trim();
    if (isNonConform) {
      const current = formatChecklistIssueNotes(
        item.category,
        item.item_name,
        issueCodes,
        trimmed,
      );
      if ((current ?? null) !== (item.notes ?? null)) {
        persist(item.status, issueCodes, trimmed);
      }
      return;
    }

    if (trimmed !== (item.notes ?? "")) {
      onUpdate(item.id, item.status, trimmed || undefined);
    }
  };

  const closeOptionalNotes = () => {
    if (isNonConform) return;
    setManualObservation("");
    setShowOptionalNotes(false);
    if (item.notes?.trim()) {
      onUpdate(item.id, item.status, undefined);
    }
  };

  return (
    <li
      className={cn(
        "border-b border-border/60 px-3 py-3.5 transition-colors last:border-b-0 sm:px-4 sm:py-4",
        isPending && pendingMeta.itemBg,
        isNonConform && ressalvasMeta.itemBg,
      )}
    >
      <div className="space-y-2.5">
        <div className="flex items-start gap-2.5">
          <span
            className={cn(
              "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
              isPending
                ? pendingMeta.itemIndexBg
                : isNonConform
                  ? ressalvasMeta.itemIndexBg
                  : "bg-muted text-muted-foreground",
            )}
          >
            {index + 1}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold leading-snug">{item.item_name}</p>
            {criteria && (
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{criteria}</p>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Resultado da inspeção
          </p>
          <ChecklistStatusToggle
            value={item.status}
            disabled={disabled}
            onChange={handleStatusChange}
            compact
            fullWidth
          />
        </div>
      </div>

      {isNonConform ? (
        <ChecklistIssuePicker
          itemId={item.id}
          options={options}
          selectedCodes={issueCodes}
          manualObservation={manualObservation}
          disabled={disabled}
          showValidation={needsIssue}
          onToggleCode={handleToggleCode}
          onManualChange={setManualObservation}
          onManualBlur={handleManualBlur}
        />
      ) : showOptionalNotes ? (
        <div className="mt-3 space-y-2 rounded-xl border border-border bg-muted/20 p-3">
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs font-semibold text-foreground">
              Observações técnicas
              <span className="ml-1 font-normal text-muted-foreground">· opcional</span>
            </p>
            <button
              type="button"
              disabled={disabled}
              onClick={closeOptionalNotes}
              className="shrink-0 text-[11px] font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline disabled:opacity-50"
            >
              Fechar
            </button>
          </div>
          <textarea
            id={`notes-${item.id}`}
            value={manualObservation}
            disabled={disabled}
            rows={2}
            placeholder="Ex.: pequeno risco superficial, dentro do padrão..."
            onChange={(e) => setManualObservation(e.target.value)}
            onBlur={handleManualBlur}
            className={cn(
              "w-full resize-y rounded-lg border border-border bg-card px-3 py-2.5 text-sm",
              "focus-visible:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
              "disabled:opacity-50",
            )}
          />
        </div>
      ) : (
        isEvaluated && (
          <button
            type="button"
            disabled={disabled}
            onClick={() => setShowOptionalNotes(true)}
            className={cn(
              "mt-3 flex w-full items-center gap-3 rounded-xl border border-dashed border-border bg-muted/20 px-3 py-3 text-left transition-colors",
              "hover:border-primary/30 hover:bg-muted/40 active:bg-muted/50 disabled:opacity-50",
            )}
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-background text-muted-foreground shadow-soft">
              <MessageSquarePlus className="size-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-semibold text-foreground">
                Observações técnicas
              </span>
              <span className="mt-0.5 block text-[11px] text-muted-foreground">
                Opcional. Toque para registrar achados ou apontamentos.
              </span>
            </span>
            <ChevronDown className="size-4 shrink-0 -rotate-90 text-muted-foreground" />
          </button>
        )
      )}
    </li>
  );
}
