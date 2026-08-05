import { useMemo } from "react";
import type { ChecklistItem } from "@/services/checklist-service";
import { CompactChecklistItem } from "@/components/checklist/compact-checklist-item";
import { summarizeChecklist } from "@/components/checklist/checklist-summary";
import {
  CHECKLIST_CATALOG,
  CHECKLIST_CATEGORY_ORDER,
  getChecklistCategoryLabel,
} from "@/lib/checklist-catalog";
import { ChecklistStatus } from "@/lib/enums";
import { cn } from "@/lib/utils";

type CompactChecklistFormProps = {
  items: ChecklistItem[];
  onUpdate: (id: string, status: string, notes?: string) => void;
  disabled?: boolean;
};

export function CompactChecklistForm({ items, onUpdate, disabled }: CompactChecklistFormProps) {
  const summary = summarizeChecklist(items);

  const grouped = useMemo(() => {
    const map = items.reduce<Record<string, ChecklistItem[]>>((acc, item) => {
      (acc[item.category] ??= []).push(item);
      return acc;
    }, {});

    return CHECKLIST_CATEGORY_ORDER.filter((key) => map[key]?.length).map((key) => ({
      key,
      items: map[key] ?? [],
      description: CHECKLIST_CATALOG.find((c) => c.key === key)?.description,
    }));
  }, [items]);

  const progress = items.length > 0 ? Math.round((summary.evaluated / items.length) * 100) : 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3 rounded-lg bg-muted/30 px-3 py-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-foreground">
              {summary.evaluated}/{items.length} avaliados
            </span>
            <span className="text-muted-foreground">{progress}%</span>
          </div>
          <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        {summary.naoConforme > 0 && (
          <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
            {summary.naoConforme} apont.
          </span>
        )}
      </div>

      {grouped.map((group) => {
        const evaluated = group.items.filter((i) => i.status !== ChecklistStatus.PENDENTE).length;
        const allDone = evaluated === group.items.length;

        return (
          <div
            key={group.key}
            className="overflow-hidden rounded-lg border border-border/80 bg-card"
          >
            <div className="flex items-center justify-between gap-2 border-b border-border/50 bg-muted/20 px-3 py-2">
              <div className="min-w-0">
                <h3 className="text-[11px] font-bold uppercase tracking-wide text-foreground">
                  {getChecklistCategoryLabel(group.key)}
                </h3>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold",
                  allDone ? "bg-emerald-50 text-emerald-700" : "bg-muted text-muted-foreground",
                )}
              >
                {evaluated}/{group.items.length}
              </span>
            </div>
            <ul>
              {group.items.map((item) => (
                <CompactChecklistItem
                  key={item.id}
                  item={item}
                  disabled={disabled}
                  onUpdate={onUpdate}
                />
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
