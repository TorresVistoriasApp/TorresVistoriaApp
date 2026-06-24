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
  DOCUMENTOS: "Documentação do veículo",
  DANOS: "Danos",
  PINTURA_CAPO: "01 · Capô",
  PINTURA_TETO: "02 · Teto pintura",
  PINTURA_TAMPA_PORTA_MALAS: "03 · Tampa do porta-malas",
  PINTURA_PARALAMA_DIANTEIRO_ESQUERDO: "04 · Paralama dianteiro esquerdo",
  PINTURA_PORTA_DIANTEIRA_ESQUERDA: "05 · Porta dianteira esquerda",
  PINTURA_PORTA_TRASEIRA_ESQUERDA: "06 · Porta traseira esquerda",
  PINTURA_TRASEIRA_ESQUERDA: "07 · Traseira esquerda",
  PINTURA_TRASEIRA_DIREITA: "08 · Traseira direita",
  PINTURA_PORTA_TRASEIRA_DIREITA: "09 · Porta traseira direita",
  PINTURA_PORTA_DIANTEIRA_DIREITA: "10 · Porta dianteira direita",
  PINTURA_PARALAMA_DIANTEIRO_DIREITO: "11 · Paralama dianteiro direito",
  PINTURA_PARACHOQUE_DIANTEIRO: "12 · Para-choque dianteiro",
  PINTURA_PARACHOQUE_TRASEIRO: "13 · Para-choque traseiro",
  EXTRAS: "Fotos extras",
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
