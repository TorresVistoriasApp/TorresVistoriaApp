import { useState } from "react";
import type { ChecklistItem } from "@/services/checklist-service";
import { ChecklistStatus } from "@/lib/enums";
import { getChecklistItemCriteria } from "@/lib/checklist-catalog";
import { ChecklistStatusToggle } from "@/components/checklist/checklist-status-toggle";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";

type ChecklistItemProps = {
  item: ChecklistItem;
  index: number;
  disabled?: boolean;
  onUpdate: (id: string, status: string, notes?: string) => void;
};

export function ChecklistItemRow({ item, index, disabled, onUpdate }: ChecklistItemProps) {
  const [notes, setNotes] = useState(item.notes ?? "");
  const criteria = getChecklistItemCriteria(item.category, item.item_name);
  const isPending = item.status === ChecklistStatus.PENDENTE;
  const isNonConform = item.status === ChecklistStatus.NAO_CONFORME;
  const needsNote = isNonConform && !notes.trim();

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
        "border-b border-border/60 p-4 transition-colors last:border-b-0",
        isPending && "bg-amber-50/40",
        isNonConform && "bg-red-50/30",
      )}
    >
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-start gap-2">
            <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-bold text-muted-foreground">
              {index + 1}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-snug">{item.item_name}</p>
              {criteria && (
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{criteria}</p>
              )}
            </div>
          </div>
        </div>

        <ChecklistStatusToggle
          value={item.status}
          disabled={disabled}
          onChange={handleStatusChange}
          compact
        />
      </div>

      <div className="mt-3 space-y-1.5 pl-8">
        <Label htmlFor={`notes-${item.id}`} className="text-xs font-medium text-muted-foreground">
          Observações técnicas
          {isNonConform && <span className="ml-1 text-destructive">*</span>}
        </Label>
        <textarea
          id={`notes-${item.id}`}
          value={notes}
          disabled={disabled}
          rows={2}
          placeholder={
            isNonConform
              ? "Obrigatório: descreva a não conformidade para o laudo..."
              : "Registre achados, medições ou ressalvas..."
          }
          onChange={(e) => setNotes(e.target.value)}
          onBlur={handleNotesBlur}
          className={cn(
            "w-full resize-y rounded-xl border bg-card px-3 py-2 text-sm shadow-soft",
            "focus-visible:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
            "disabled:opacity-50",
            needsNote && "border-destructive/50 ring-1 ring-destructive/20",
          )}
        />
        {needsNote && (
          <p className="flex items-center gap-1 text-xs text-destructive">
            <AlertCircle className="size-3.5" />
            Observação obrigatória para itens não conformes (exigência pericial).
          </p>
        )}
      </div>
    </li>
  );
}
