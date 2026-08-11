import { memo, useEffect, useMemo, useState } from "react";
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

type CompactChecklistItemProps = {
  item: ChecklistItem;
  disabled?: boolean;
  isActive?: boolean;
  onActivate?: (id: string) => void;
  onUpdate: (id: string, status: string, notes?: string) => void;
};

function CompactChecklistItemComponent({
  item,
  disabled,
  isActive = false,
  onActivate,
  onUpdate,
}: CompactChecklistItemProps) {
  const criteria = getChecklistItemCriteria(item.category, item.item_name);
  const statusMeta = getChecklistStatusMeta(item.status);
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

  const isNonConform = item.status === ChecklistStatus.NAO_CONFORME;
  const persistedNotes = formatChecklistIssueNotes(
    item.category,
    item.item_name,
    issueCodes,
    manualObservation,
  );
  const needsIssue = isNonConform && !persistedNotes;
  /** Só o item ativo mostra o painel completo — reduz scroll. */
  const showIssuePanel = isNonConform && isActive;

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
    onActivate?.(item.id);

    if (status === ChecklistStatus.NAO_CONFORME) {
      persist(status, issueCodes, manualObservation);
      return;
    }

    setIssueCodes([]);
    setManualObservation("");
    onUpdate(item.id, status, undefined);
  };

  const handleToggleCode = (code: string) => {
    onActivate?.(item.id);
    const next = issueCodes.includes(code)
      ? issueCodes.filter((c) => c !== code)
      : [...issueCodes, code];
    setIssueCodes(next);
    persist(ChecklistStatus.NAO_CONFORME, next, manualObservation);
  };

  const handleManualBlur = () => {
    const trimmed = manualObservation.trim();
    const current = formatChecklistIssueNotes(
      item.category,
      item.item_name,
      issueCodes,
      trimmed,
    );
    if ((current ?? null) !== (item.notes ?? null)) {
      persist(item.status, issueCodes, trimmed);
    }
  };

  return (
    <li className="px-1.5 py-1 sm:px-2">
      <div
        className={cn(
          "relative overflow-hidden rounded-lg border px-2.5 py-2 transition-colors duration-150",
          statusMeta.itemCard,
          isActive && "shadow-sm ring-1 ring-primary/25",
          needsIssue && "ring-1 ring-amber-400/50",
        )}
        onFocusCapture={() => onActivate?.(item.id)}
        onClick={() => onActivate?.(item.id)}
      >
        <span
          className={cn("absolute inset-y-0 left-0 w-1", statusMeta.itemAccent)}
          aria-hidden
        />

        <div className="space-y-1.5 pl-1.5">
          <div className="min-w-0">
            <p className="text-[13px] font-semibold leading-snug text-foreground sm:text-sm">
              {item.item_name}
            </p>
            {criteria && (
              <p className="mt-0.5 line-clamp-1 text-[10px] leading-tight text-muted-foreground sm:text-[11px]">
                {criteria}
              </p>
            )}
          </div>

          <ChecklistStatusToggle
            value={item.status}
            disabled={disabled}
            onChange={handleStatusChange}
            variant="segmented"
            fullWidth
          />

          {isNonConform && (
            <ChecklistIssuePicker
              itemId={item.id}
              options={options}
              selectedCodes={issueCodes}
              manualObservation={manualObservation}
              disabled={disabled}
              showValidation={needsIssue}
              collapsed={!showIssuePanel}
              onToggleCode={handleToggleCode}
              onManualChange={setManualObservation}
              onManualBlur={handleManualBlur}
              onExpand={() => onActivate?.(item.id)}
            />
          )}
        </div>
      </div>
    </li>
  );
}

export const CompactChecklistItem = memo(CompactChecklistItemComponent);
