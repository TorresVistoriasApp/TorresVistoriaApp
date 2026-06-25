import { useEffect, useState } from "react";
import type { ChecklistItem } from "@/services/checklist-service";
import { ChecklistStatus } from "@/lib/enums";
import { getChecklistItemCriteria } from "@/lib/checklist-catalog";
import { ChecklistStatusToggle } from "@/components/checklist/checklist-status-toggle";
import { cn } from "@/lib/utils";
import { AlertCircle, ChevronDown, MessageSquarePlus } from "lucide-react";

type ChecklistItemProps = {
  item: ChecklistItem;
  index: number;
  disabled?: boolean;
  onUpdate: (id: string, status: string, notes?: string) => void;
};

export function ChecklistItemRow({ item, index, disabled, onUpdate }: ChecklistItemProps) {
  const [notes, setNotes] = useState(item.notes ?? "");
  const [showOptionalNotes, setShowOptionalNotes] = useState(
    () =>
      !!item.notes?.trim() &&
      item.status !== ChecklistStatus.CONFORME &&
      item.status !== ChecklistStatus.PENDENTE,
  );
  const criteria = getChecklistItemCriteria(item.category, item.item_name);
  const isPending = item.status === ChecklistStatus.PENDENTE;
  const isNonConform = item.status === ChecklistStatus.NAO_CONFORME;
  const isEvaluated = !isPending;
  const needsNote = isNonConform && !notes.trim();
  const showNotesField = isNonConform || showOptionalNotes;

  useEffect(() => {
    if (isNonConform) {
      setShowOptionalNotes(true);
    }
  }, [isNonConform]);

  const handleStatusChange = (status: string) => {
    const isNowNonConform = status === ChecklistStatus.NAO_CONFORME;
    const isNowPending = status === ChecklistStatus.PENDENTE;

    if (isNowNonConform) {
      setShowOptionalNotes(true);
    } else if (!notes.trim()) {
      setShowOptionalNotes(false);
    }

    if (isNowPending) {
      setShowOptionalNotes(false);
    }

    onUpdate(item.id, status, notes.trim() || undefined);
  };

  const handleNotesBlur = () => {
    const trimmed = notes.trim();
    if (trimmed !== (item.notes ?? "")) {
      onUpdate(item.id, item.status, trimmed || undefined);
    }
  };

  const closeOptionalNotes = () => {
    if (isNonConform) return;
    setNotes("");
    setShowOptionalNotes(false);
    if (item.notes?.trim()) {
      onUpdate(item.id, item.status, undefined);
    }
  };

  return (
    <li
      className={cn(
        "border-b border-border/60 px-3 py-3.5 transition-colors last:border-b-0 sm:px-4 sm:py-4",
        isPending && "bg-amber-50/40",
        isNonConform && "bg-red-50/30",
      )}
    >
      <div className="space-y-2.5">
        <div className="flex items-start gap-2.5">
          <span
            className={cn(
              "mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold",
              isPending
                ? "bg-amber-100 text-amber-800"
                : isNonConform
                  ? "bg-red-100 text-destructive"
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

      {showNotesField ? (
        <div
          className={cn(
            "mt-3 space-y-2 rounded-xl border p-3",
            isNonConform
              ? "border-destructive/40 bg-destructive/[0.04]"
              : "border-border bg-muted/20",
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p
                className={cn(
                  "text-xs font-semibold",
                  isNonConform ? "text-destructive" : "text-foreground",
                )}
              >
                Observações técnicas
                {isNonConform ? (
                  <span className="ml-1 font-bold">· obrigatório</span>
                ) : (
                  <span className="ml-1 font-normal text-muted-foreground">· opcional</span>
                )}
              </p>
              {isNonConform && (
                <p className="mt-0.5 text-[11px] text-destructive/80">
                  Descreva a não conformidade para validar o laudo.
                </p>
              )}
            </div>
            {!isNonConform && (
              <button
                type="button"
                disabled={disabled}
                onClick={closeOptionalNotes}
                className="shrink-0 text-[11px] font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline disabled:opacity-50"
              >
                Fechar
              </button>
            )}
          </div>

          <textarea
            id={`notes-${item.id}`}
            value={notes}
            disabled={disabled}
            rows={2}
            aria-required={isNonConform}
            placeholder={
              isNonConform
                ? "Ex.: corrosão perfurante no assoalho, lado direito..."
                : "Ex.: pequeno risco superficial, dentro do padrão..."
            }
            onChange={(e) => setNotes(e.target.value)}
            onBlur={handleNotesBlur}
            className={cn(
              "w-full resize-y rounded-lg border bg-card px-3 py-2.5 text-sm",
              "focus-visible:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20",
              "disabled:opacity-50",
              needsNote
                ? "border-destructive/60 ring-1 ring-destructive/25"
                : "border-border",
            )}
          />

          {needsNote && (
            <p className="flex items-center gap-1.5 text-xs font-medium text-destructive">
              <AlertCircle className="size-3.5 shrink-0" />
              Preencha antes de gerar o laudo.
            </p>
          )}
        </div>
      ) : (
        isEvaluated &&
        !isNonConform && (
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
                Opcional. Toque para registrar achados ou ressalvas.
              </span>
            </span>
            <ChevronDown className="size-4 shrink-0 -rotate-90 text-muted-foreground" />
          </button>
        )
      )}
    </li>
  );
}
