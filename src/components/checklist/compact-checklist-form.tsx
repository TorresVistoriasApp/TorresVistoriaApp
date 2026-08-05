import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ChecklistItem } from "@/services/checklist-service";
import { CompactChecklistItem } from "@/components/checklist/compact-checklist-item";
import { summarizeChecklist } from "@/components/checklist/checklist-summary";
import {
  CHECKLIST_CATEGORY_ORDER,
  getChecklistCategoryLabel,
} from "@/lib/checklist-catalog";
import { ChecklistStatus } from "@/lib/enums";
import { cn } from "@/lib/utils";
import { Check, ChevronDown } from "lucide-react";

type CompactChecklistFormProps = {
  items: ChecklistItem[];
  onUpdate: (id: string, status: string, notes?: string) => void;
  disabled?: boolean;
};

function isGroupComplete(groupItems: ChecklistItem[]) {
  return groupItems.every((i) => i.status !== ChecklistStatus.PENDENTE);
}

function groupProgress(groupItems: ChecklistItem[]) {
  const evaluated = groupItems.filter((i) => i.status !== ChecklistStatus.PENDENTE).length;
  const total = groupItems.length;
  const pct = total > 0 ? Math.round((evaluated / total) * 100) : 0;
  return { evaluated, total, pct };
}

export function CompactChecklistForm({ items, onUpdate, disabled }: CompactChecklistFormProps) {
  const summary = summarizeChecklist(items);
  const [openCategory, setOpenCategory] = useState<string | null>(null);
  const [flashCategory, setFlashCategory] = useState<string | null>(null);
  const prevCompleteRef = useRef<Record<string, boolean>>({});
  const pendingScrollRef = useRef(false);

  const grouped = useMemo(() => {
    const map = items.reduce<Record<string, ChecklistItem[]>>((acc, item) => {
      (acc[item.category] ??= []).push(item);
      return acc;
    }, {});

    return CHECKLIST_CATEGORY_ORDER.filter((key) => map[key]?.length).map((key) => ({
      key,
      items: map[key] ?? [],
    }));
  }, [items]);

  const firstIncompleteKey = useMemo(
    () => grouped.find((g) => !isGroupComplete(g.items))?.key ?? grouped[0]?.key ?? null,
    [grouped],
  );

  useEffect(() => {
    if (openCategory === null && firstIncompleteKey) {
      setOpenCategory(firstIncompleteKey);
    }
  }, [firstIncompleteKey, openCategory]);

  useEffect(() => {
    if (!openCategory) return;
    const group = grouped.find((g) => g.key === openCategory);
    if (!group) return;

    const complete = isGroupComplete(group.items);
    const wasComplete = prevCompleteRef.current[openCategory] ?? false;

    if (complete && !wasComplete) {
      setFlashCategory(openCategory);
      const timer = window.setTimeout(() => setFlashCategory(null), 2200);
      const idx = grouped.findIndex((g) => g.key === openCategory);
      const next = grouped.slice(idx + 1).find((g) => !isGroupComplete(g.items));
      if (next?.key) pendingScrollRef.current = true;
      setOpenCategory(next?.key ?? null);
      prevCompleteRef.current[openCategory] = true;
      return () => window.clearTimeout(timer);
    }

    prevCompleteRef.current[openCategory] = complete;
  }, [grouped, items, openCategory]);

  useEffect(() => {
    if (!openCategory || !pendingScrollRef.current) return;
    pendingScrollRef.current = false;

    // Aguarda o DOM expandir o acordeão antes de rolar
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.getElementById(`checklist-group-${openCategory}`)?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    });
  }, [openCategory]);

  const activeGroup = grouped.find((g) => g.key === openCategory);
  const activeProgress = activeGroup ? groupProgress(activeGroup.items) : null;

  const handleToggle = useCallback((key: string) => {
    setOpenCategory((current) => {
      const next = current === key ? null : key;
      if (next) pendingScrollRef.current = true;
      return next;
    });
  }, []);

  return (
    <div className="space-y-2">
      {activeGroup && activeProgress && (
        <div className="rounded-md border border-primary/15 bg-primary/[0.04] px-3 py-2">
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Categoria atual
          </p>
          <p className="text-sm font-semibold text-foreground">
            {getChecklistCategoryLabel(activeGroup.key)}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {activeProgress.evaluated} de {activeProgress.total} concluídos
          </p>
        </div>
      )}

      {flashCategory && (
        <div
          className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800"
          role="status"
        >
          <Check className="size-3.5 shrink-0" />
          {getChecklistCategoryLabel(flashCategory)} concluída
        </div>
      )}

      <div className="flex items-center justify-between gap-2 rounded-md bg-muted/30 px-2.5 py-1.5 text-xs">
        <span className="font-medium">
          {summary.evaluated}/{items.length} itens
        </span>
        <span className="text-muted-foreground">
          {items.length > 0 ? Math.round((summary.evaluated / items.length) * 100) : 0}%
        </span>
      </div>

      {grouped.map((group) => {
        const { evaluated, total, pct } = groupProgress(group.items);
        const isOpen = openCategory === group.key;
        const complete = evaluated === total;

        return (
          <div
            key={group.key}
            id={`checklist-group-${group.key}`}
            className={cn(
              "scroll-mt-36 overflow-hidden rounded-lg border border-border/70 bg-card transition-colors",
              isOpen && "border-primary/25 ring-1 ring-primary/10",
              complete && !isOpen && "border-emerald-200/60",
            )}
          >
            <button
              type="button"
              onClick={() => handleToggle(group.key)}
              className="flex w-full items-center gap-2 px-2.5 py-2.5 text-left hover:bg-muted/20 sm:px-3"
              aria-expanded={isOpen}
            >
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                  complete ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground",
                )}
              >
                {complete ? <Check className="size-3.5" /> : pct}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold leading-tight">
                  {getChecklistCategoryLabel(group.key)}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {evaluated} de {total} itens · {pct}%
                </p>
              </div>
              <ChevronDown
                className={cn(
                  "size-4 shrink-0 text-muted-foreground transition-transform duration-200",
                  isOpen && "rotate-180",
                )}
              />
            </button>

            {isOpen && (
              <ul className="border-t border-border/40">
                {group.items.map((item) => (
                  <CompactChecklistItem
                    key={item.id}
                    item={item}
                    disabled={disabled}
                    onUpdate={onUpdate}
                  />
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}
