import { useEffect, useState } from "react";
import type { ChecklistItem } from "@/services/checklist-service";
import { ChecklistStatus } from "@/lib/enums";
import { getChecklistItemCriteria } from "@/lib/checklist-catalog";
import { getChecklistStatusMeta } from "@/lib/checklist-status";
import { ChecklistStatusToggle } from "@/components/checklist/checklist-status-toggle";
import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

type CompactChecklistItemProps = {
  item: ChecklistItem;
  disabled?: boolean;
  onUpdate: (id: string, status: string, notes?: string) => void;
};

export function CompactChecklistItem({ item, disabled, onUpdate }: CompactChecklistItemProps) {
  const [notes, setNotes] = useState(item.notes ?? "");
  const criteria = getChecklistItemCriteria(item.category, item.item_name);
  const isNonConform = item.status === ChecklistStatus.NAO_CONFORME;
  const needsNote = isNonConform && !notes.trim();
  const statusMeta = getChecklistStatusMeta(item.status);

  useEffect(() => {
    setNotes(item.notes ?? "");
  }, [item.notes]);

  const handleStatusChange = (status: string) => {
    onUpdate(item.id, status, notes.trim() || undefined);
  };

  const handleNotesBlur = () => {
    const trimmed = notes.trim();
    if (trimmed !== (item.notes ?? "")) {
      onUpdate(item.id, item.status, trimmed || undefined);
    }
  };

  return (
    <li
      className={cn(
        "border-b border-border/50 last:border-b-0",
        isNonConform && "bg-amber-50/30",
      )}
    >
      <div className="flex flex-col gap-2 px-3 py-2.5 sm:flex-row sm:items-start sm:justify-between sm:gap-3 sm:px-3.5">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium leading-snug text-foreground">{item.item_name}</p>
          {criteria && (
            <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
              {criteria}
            </p>
          )}
        </div>

        <div className="shrink-0 sm:max-w-[220px] sm:flex-1">
          <ChecklistStatusToggle
            value={item.status}
            disabled={disabled}
            onChange={handleStatusChange}
            compact
            fullWidth
            className="p-0.5"
          />
          <p className="mt-1 hidden text-center text-[10px] text-muted-foreground sm:block">
            {statusMeta.shortLabel}
          </p>
        </div>
      </div>

      {isNonConform && (
        <div className="space-y-2 border-t border-amber-200/50 bg-amber-50/40 px-3 pb-3 pt-2 sm:px-3.5">
          <p className="text-[11px] font-medium text-amber-900">
            Observação obrigatória
          </p>
          <textarea
            id={`notes-${item.id}`}
            value={notes}
            disabled={disabled}
            rows={2}
            aria-required
            placeholder="Descreva o apontamento encontrado..."
            onChange={(e) => setNotes(e.target.value)}
            onBlur={handleNotesBlur}
            className={cn(
              "w-full resize-y rounded-lg border bg-card px-3 py-2 text-sm",
              "focus-visible:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
              "disabled:opacity-50",
              needsNote ? "border-amber-500/60" : "border-border",
            )}
          />
          {needsNote && (
            <p className="flex items-center gap-1 text-[11px] font-medium text-amber-800">
              <AlertCircle className="size-3 shrink-0" />
              Preencha antes de gerar o laudo.
            </p>
          )}
        </div>
      )}
    </li>
  );
}
