import type { ChecklistItem } from "@/modules/torres-vistoria/services/checklist-service";
import { ChecklistItemRow } from "@/modules/torres-vistoria/components/checklist/checklist-item";
import { getChecklistCategoryLabel } from "@/modules/torres-vistoria/domain/checklist/checklist-catalog";
import { getChecklistStatusShortLabel } from "@/modules/torres-vistoria/domain/checklist/checklist-status";
import { ChecklistStatus } from "@/modules/torres-vistoria/domain/enums";
import { cn } from "@/shared/lib/utils";

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
    <section className="ui-panel overflow-hidden">
      <header className="border-b border-border bg-muted px-3 py-2.5 sm:px-5 sm:py-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="text-[13px] font-bold text-foreground sm:text-sm">
              {getChecklistCategoryLabel(category)}
            </h3>
            {description && (
              <p className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground sm:line-clamp-none sm:text-xs">
                {description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span
              className={cn(
                "ui-metric rounded-full border px-2.5 py-1 font-semibold",
                allDone
                  ? "border-success-border bg-success-subtle text-success"
                  : "border-border bg-muted text-muted-foreground",
              )}
            >
              {evaluated}/{items.length}
            </span>
            {nonConform > 0 && (
              <span className="rounded-full border border-warning-border bg-warning-subtle px-2.5 py-1 font-semibold text-warning">
                {nonConform} {getChecklistStatusShortLabel(ChecklistStatus.NAO_CONFORME)}
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
