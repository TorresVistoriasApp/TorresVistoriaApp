import { PHOTO_CATEGORIES } from "@/lib/constants";
import { cn } from "@/lib/utils";

const categoryLabels: Record<string, string> = {
  FRENTE_45_DIREITA: "Frente 45° direita",
  FRENTE_45_ESQUERDA: "Frente 45° esquerda",
  TRASEIRA_45_DIREITA: "Traseira 45° direita",
  TRASEIRA_45_ESQUERDA: "Traseira 45° esquerda",
  LATERAL_DIREITA: "Lateral direita",
  LATERAL_ESQUERDA: "Lateral esquerda",
  PLACA_DIANTEIRA: "Placa dianteira",
  PLACA_TRASEIRA: "Placa traseira",
  MOTOR: "Motor",
  MOTOR_NUMERO: "Número do motor",
  CHASSI: "Chassi",
  PAINEL: "Painel",
  HODOMETRO: "Hodômetro",
  ESTRUTURA_DIANTEIRA: "Estrutura dianteira",
  ESTRUTURA_TRASEIRA: "Estrutura traseira",
  CAIXA_AR: "Caixas de ar",
  ASSOALHO_PORTA_MALAS: "Assoalho/porta-malas",
  VIDROS: "Vidros",
  ETIQUETAS: "Etiquetas",
  INTERIOR: "Interior",
  CINTOS_AIRBAGS: "Cintos e airbags",
  DOCUMENTOS: "Documentos",
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
