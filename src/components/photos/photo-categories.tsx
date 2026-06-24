import { PHOTO_CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const categoryLabels: Record<string, string> = {
  FRENTE_45: "Frente 45°",
  TRASEIRA_45: "Traseira 45°",
  LATERAL_DIREITA: "Lateral direita",
  LATERAL_ESQUERDA: "Lateral esquerda",
  MOTOR: "Motor",
  CHASSI: "Chassi",
  PAINEL: "Painel",
  HODOMETRO: "Hodômetro",
  ESTRUTURA: "Estrutura",
  VIDROS: "Vidros",
  ETIQUETAS: "Etiquetas",
  DANOS: "Danos",
  EXTRAS: "Extras",
};

export function PhotoCategories({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (category: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {PHOTO_CATEGORIES.map((cat) => (
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
          {categoryLabels[cat] ?? cat.replace(/_/g, " ")}
        </button>
      ))}
    </div>
  );
}

export { categoryLabels as PHOTO_CATEGORY_LABELS };
