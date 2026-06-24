export type PaintPart = {
  code: string;
  number: string;
  label: string;
  photoCategory: string;
};

/** Pontos de pintura — cada um corresponde a uma categoria fotográfica obrigatória. */
export const PAINT_PARTS: PaintPart[] = [
  { code: "CAPO", number: "01", label: "Capô", photoCategory: "PINTURA_CAPO" },
  { code: "TETO", number: "02", label: "Teto pintura", photoCategory: "PINTURA_TETO" },
  { code: "TAMPA_PORTA_MALAS", number: "03", label: "Tampa do porta-malas", photoCategory: "PINTURA_TAMPA_PORTA_MALAS" },
  { code: "PARALAMA_DIANTEIRO_ESQUERDO", number: "04", label: "Paralama dianteiro esquerdo", photoCategory: "PINTURA_PARALAMA_DIANTEIRO_ESQUERDO" },
  { code: "PORTA_DIANTEIRA_ESQUERDA", number: "05", label: "Porta dianteira esquerda", photoCategory: "PINTURA_PORTA_DIANTEIRA_ESQUERDA" },
  { code: "PORTA_TRASEIRA_ESQUERDA", number: "06", label: "Porta traseira esquerda", photoCategory: "PINTURA_PORTA_TRASEIRA_ESQUERDA" },
  { code: "TRASEIRA_ESQUERDA", number: "07", label: "Traseira esquerda", photoCategory: "PINTURA_TRASEIRA_ESQUERDA" },
  { code: "TRASEIRA_DIREITA", number: "08", label: "Traseira direita", photoCategory: "PINTURA_TRASEIRA_DIREITA" },
  { code: "PORTA_TRASEIRA_DIREITA", number: "09", label: "Porta traseira direita", photoCategory: "PINTURA_PORTA_TRASEIRA_DIREITA" },
  { code: "PORTA_DIANTEIRA_DIREITA", number: "10", label: "Porta dianteira direita", photoCategory: "PINTURA_PORTA_DIANTEIRA_DIREITA" },
  { code: "PARALAMA_DIANTEIRO_DIREITO", number: "11", label: "Paralama dianteiro direito", photoCategory: "PINTURA_PARALAMA_DIANTEIRO_DIREITO" },
  { code: "PARACHOQUE_DIANTEIRO", number: "12", label: "Para-choque dianteiro", photoCategory: "PINTURA_PARACHOQUE_DIANTEIRO" },
  { code: "PARACHOQUE_TRASEIRO", number: "13", label: "Para-choque traseiro", photoCategory: "PINTURA_PARACHOQUE_TRASEIRO" },
];
