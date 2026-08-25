import { PHOTO_CATEGORY_LABELS, PHOTO_CATEGORY_KEYS } from "@/modules/torres-vistoria/domain/photos/photo-catalog";
import { cn } from "@/shared/lib/utils";

export function PhotoCategories({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (category: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {PHOTO_CATEGORY_KEYS.map((cat) => (
        <button
          key={cat}
          type="button"
          onClick={() => onSelect(cat)}
          className={cn(
            "touch-target rounded-full px-3 py-1.5 text-xs font-semibold transition-all",
            selected === cat
              ? "bg-primary text-primary-foreground shadow-soft"
              : "border border-border bg-card text-muted-foreground hover:bg-brand-subtle hover:text-primary",
          )}
        >
          {PHOTO_CATEGORY_LABELS[cat] ?? cat.replace(/_/g, " ")}
        </button>
      ))}
    </div>
  );
}

export { PHOTO_CATEGORY_LABELS };
