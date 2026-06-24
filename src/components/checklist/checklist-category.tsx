import type { ChecklistItem } from "@/services/checklist-service";
import { ChecklistItemRow } from "@/components/checklist/checklist-item";
import { getChecklistCategoryLabel } from "@/lib/checklist-catalog";
import { ChecklistStatus } from "@/lib/enums";
import { cn } from "@/lib/utils";

type ChecklistCategoryProps = {
  category: string;
  description?: string;
  items: ChecklistItem[];
  startIndex: number;
  disabled?: boolean;
  onUpdate: (id: string, status: string, notes?: string) => void;
};

export function ChecklistCategory({
  category,
  description,
  items,
  startIndex,
  disabled,
  onUpdate,
}: ChecklistCategoryProps) {
  const evaluated = items.filter((i) => i.status !== ChecklistStatus.PENDENTE).length;
  const nonConform = items.filter((i) => i.status === ChecklistStatus.NAO_CONFORME).length;
  const allDone = evaluated === items.length;

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card shadow-soft">
      <header className="border-b border-border bg-muted/30 px-4 py-3 sm:px-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide">
              {getChecklistCategoryLabel(category)}
            </h3>
            {description && (
              <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span
              className={cn(
                "rounded-full px-2.5 py-1 font-semibold",
                allDone
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {evaluated}/{items.length}
            </span>
            {nonConform > 0 && (
              <span className="rounded-full bg-red-100 px-2.5 py-1 font-semibold text-destructive dark:bg-red-950">
                {nonConform} NC
              </span>
            )}
          </div>
        </div>
      </header>
      <ul>
        {items.map((item, idx) => (
          <ChecklistItemRow
            key={item.id}
            item={item}
            index={startIndex + idx}
            disabled={disabled}
            onUpdate={onUpdate}
          />
        ))}
      </ul>
    </section>
  );
}
