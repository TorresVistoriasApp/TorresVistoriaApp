import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ChecklistItem } from "@/modules/torres-vistoria/services/checklist-service";
import { CompactChecklistItem } from "@/modules/torres-vistoria/components/checklist/compact-checklist-item";
import { summarizeChecklist } from "@/modules/torres-vistoria/components/checklist/checklist-summary";
import {
  CHECKLIST_CATEGORY_ORDER,
  getChecklistCategoryLabel,
} from "@/modules/torres-vistoria/domain/checklist/checklist-catalog";
import { ChecklistStatus } from "@/modules/torres-vistoria/domain/enums";
import { cn } from "@/shared/lib/utils";
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
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
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
      setActiveItemId(null);
      const timer = window.setTimeout(() => setFlashCategory(null), 1800);
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

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        document.getElementById(`checklist-group-${openCategory}`)?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    });
  }, [openCategory]);

  const handleToggle = useCallback((key: string) => {
    setOpenCategory((current) => {
      const next = current === key ? null : key;
      if (next) pendingScrollRef.current = true;
      return next;
    });
    setActiveItemId(null);
  }, []);

  const handleActivateItem = useCallback((id: string) => {
    setActiveItemId(id);
  }, []);

  const handleUpdate = useCallback(
    (id: string, status: string, notes?: string) => {
      setActiveItemId(id);
      onUpdate(id, status, notes);
    },
    [onUpdate],
  );

  return (
    <div className="space-y-1.5">
      {flashCategory && (
        <div
          className="flex items-center gap-1.5 rounded-md border border-success-border bg-success-subtle px-2.5 py-1.5 text-[11px] font-semibold text-success"
          role="status"
        >
          <Check className="size-3 shrink-0" />
          {getChecklistCategoryLabel(flashCategory)} concluída
        </div>
      )}

      <div className="flex items-center justify-between px-0.5 text-[11px] text-muted-foreground">
        <span className="font-medium text-foreground">
          {summary.evaluated} de {items.length}
        </span>
        <span className="tabular-nums">
          {items.length > 0 ? Math.round((summary.evaluated / items.length) * 100) : 0}%
        </span>
      </div>

      {grouped.map((group) => {
        const { evaluated, total } = groupProgress(group.items);
        const isOpen = openCategory === group.key;
        const complete = evaluated === total;

        return (
          <div
            key={group.key}
            id={`checklist-group-${group.key}`}
            className={cn(
              "scroll-mt-36 overflow-hidden rounded-lg border border-border bg-card",
              isOpen && "border-border-strong",
              complete && !isOpen && "border-success-border",
            )}
          >
            <button
              type="button"
              onClick={() => handleToggle(group.key)}
              className="flex w-full items-center gap-2 px-2.5 py-2 text-left transition-colors duration-150 hover:bg-brand-subtle sm:px-3"
              aria-expanded={isOpen}
            >
              <span
                className={cn(
                  "flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold",
                  complete ? "bg-success-subtle text-success" : "bg-muted text-muted-foreground",
                )}
              >
                {complete ? <Check className="size-3" /> : evaluated}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold leading-tight sm:text-sm">
                  {getChecklistCategoryLabel(group.key)}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {evaluated} de {total}
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
              <ul className="space-y-0 border-t border-border bg-muted py-1">
                {group.items.map((item) => (
                  <CompactChecklistItem
                    key={item.id}
                    item={item}
                    disabled={disabled}
                    isActive={activeItemId === item.id}
                    onActivate={handleActivateItem}
                    onUpdate={handleUpdate}
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
