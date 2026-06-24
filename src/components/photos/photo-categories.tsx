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
            "touch-target rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
            selected === cat
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-background hover:bg-muted",
          )}
        >
          {categoryLabels[cat] ?? cat.replace(/_/g, " ")}
        </button>
      ))}
    </div>
  );
}

export { categoryLabels as PHOTO_CATEGORY_LABELS };
