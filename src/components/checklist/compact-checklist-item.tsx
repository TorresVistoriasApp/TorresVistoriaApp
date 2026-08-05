import { useEffect, useState } from "react";
import type { ChecklistItem } from "@/services/checklist-service";
import { ChecklistStatus } from "@/lib/enums";
import { getChecklistItemCriteria } from "@/lib/checklist-catalog";
import { ChecklistStatusToggle } from "@/components/checklist/checklist-status-toggle";
import { cn } from "@/lib/utils";
import { AlertCircle, Camera } from "lucide-react";

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
        "border-b border-border/40 px-2.5 py-2 last:border-b-0 sm:px-3",
        isNonConform && "bg-amber-50/25",
      )}
    >
      <div className="space-y-1.5">
        <div className="min-w-0">
          <p className="text-sm font-medium leading-snug text-foreground">{item.item_name}</p>
          {criteria && (
            <p className="mt-0.5 line-clamp-1 text-[11px] text-muted-foreground">{criteria}</p>
          )}
        </div>
        <ChecklistStatusToggle
          value={item.status}
          disabled={disabled}
          onChange={handleStatusChange}
          variant="segmented"
          fullWidth
        />
      </div>

      {isNonConform && (
        <div className="mt-2 space-y-1.5 rounded-md border border-amber-200/60 bg-amber-50/50 p-2">
          <p className="text-[11px] font-medium text-amber-900">Observação obrigatória</p>
          <textarea
            id={`notes-${item.id}`}
            value={notes}
            disabled={disabled}
            rows={2}
            aria-required
            placeholder="Descreva o apontamento..."
            onChange={(e) => setNotes(e.target.value)}
            onBlur={handleNotesBlur}
            className={cn(
              "w-full resize-y rounded-md border bg-card px-2.5 py-2 text-sm",
              "focus-visible:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
              needsNote ? "border-amber-500/60" : "border-border",
            )}
          />
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <Camera className="size-3 shrink-0 opacity-50" aria-hidden />
            <span>Fotos do apontamento em breve</span>
          </div>
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
