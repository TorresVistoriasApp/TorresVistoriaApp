import type { ChecklistItem } from "@/services/checklist-service";
import { ChecklistCategory } from "@/components/checklist/checklist-category";
import { ChecklistSummary, summarizeChecklist } from "@/components/checklist/checklist-summary";

export function ChecklistForm({
  items,
  onUpdate,
  disabled,
}: {
  items: ChecklistItem[];
  onUpdate: (id: string, status: string, notes?: string) => void;
  disabled?: boolean;
}) {
  const grouped = items.reduce<Record<string, ChecklistItem[]>>((acc, item) => {
    (acc[item.category] ??= []).push(item);
    return acc;
  }, {});

  const summary = summarizeChecklist(items);

  return (
    <div className="space-y-4">
      <ChecklistSummary {...summary} />
      {Object.entries(grouped).map(([category, categoryItems]) => (
        <ChecklistCategory
          key={category}
          category={category}
          items={categoryItems}
          disabled={disabled}
          onUpdate={onUpdate}
        />
      ))}
    </div>
  );
}
