import type { ChecklistItem } from "@/services/checklist-service";
import { ChecklistStatus } from "@/lib/enums";
import { cn } from "@/lib/utils";

const statusOptions = Object.values(ChecklistStatus);

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

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([category, categoryItems]) => (
        <section key={category} className="rounded-lg border border-border">
          <h3 className="border-b border-border bg-muted/50 px-4 py-2 font-medium">
            {category.replace(/_/g, " ")}
          </h3>
          <ul className="divide-y divide-border">
            {categoryItems.map((item) => (
              <li key={item.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center">
                <span className="min-w-0 flex-1 text-sm font-medium">{item.item_name}</span>
                <div className="flex flex-wrap gap-1">
                  {statusOptions.map((status) => (
                    <button
                      key={status}
                      type="button"
                      disabled={disabled}
                      onClick={() => onUpdate(item.id, status, item.notes ?? undefined)}
                      className={cn(
                        "touch-target rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                        item.status === status
                          ? status === ChecklistStatus.CONFORME
                            ? "bg-success text-white"
                            : status === ChecklistStatus.NAO_CONFORME
                              ? "bg-destructive text-white"
                              : "bg-muted-foreground text-white"
                          : "bg-muted hover:bg-muted/80",
                      )}
                    >
                      {status.replace(/_/g, " ")}
                    </button>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
