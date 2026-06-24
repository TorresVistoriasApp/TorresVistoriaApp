import type { ChecklistItem } from "@/services/checklist-service";
import { ChecklistStatus } from "@/lib/enums";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const statusOptions = Object.values(ChecklistStatus);

type ChecklistItemProps = {
  item: ChecklistItem;
  disabled?: boolean;
  onUpdate: (id: string, status: string, notes?: string) => void;
};

export function ChecklistItemRow({ item, disabled, onUpdate }: ChecklistItemProps) {
  return (
    <li className="flex flex-col gap-3 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
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
      </div>
      <div className="space-y-1">
        <Label htmlFor={`notes-${item.id}`} className="text-xs text-muted-foreground">
          Observações
        </Label>
        <Input
          id={`notes-${item.id}`}
          defaultValue={item.notes ?? ""}
          disabled={disabled}
          placeholder="Descreva anormalidades, se houver..."
          className="touch-target text-sm"
          onBlur={(e) => {
            const notes = e.target.value.trim();
            if (notes !== (item.notes ?? "")) {
              onUpdate(item.id, item.status, notes || undefined);
            }
          }}
        />
      </div>
    </li>
  );
}
