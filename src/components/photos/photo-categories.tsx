import { PHOTO_CATEGORY_LABELS, PHOTO_CATEGORY_KEYS } from "@/lib/photos/photo-catalog";
import { cn } from "@/lib/utils";

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
              ? "gradient-primary text-primary-foreground shadow-glow"
              : "border border-border bg-card text-muted-foreground hover:border-primary/30",
          )}
        >
          {PHOTO_CATEGORY_LABELS[cat] ?? cat.replace(/_/g, " ")}
        </button>
      ))}
    </div>
  );
}

export { PHOTO_CATEGORY_LABELS };
