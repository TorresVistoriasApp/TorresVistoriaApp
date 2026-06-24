import type { ChecklistItem } from "@/services/checklist-service";
import { ChecklistItemRow } from "@/components/checklist/checklist-item";

type ChecklistCategoryProps = {
  category: string;
  items: ChecklistItem[];
  disabled?: boolean;
  onUpdate: (id: string, status: string, notes?: string) => void;
};

export function ChecklistCategory({ category, items, disabled, onUpdate }: ChecklistCategoryProps) {
  return (
    <section className="rounded-lg border border-border">
      <h3 className="border-b border-border bg-muted/50 px-4 py-2 font-medium">
        {category.replace(/_/g, " ")}
      </h3>
      <ul className="divide-y divide-border">
        {items.map((item) => (
          <ChecklistItemRow key={item.id} item={item} disabled={disabled} onUpdate={onUpdate} />
        ))}
      </ul>
    </section>
  );
}
