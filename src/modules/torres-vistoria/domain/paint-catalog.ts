export type PaintPart = {
  code: string;
  number: string;
  label: string;
  photoCategory: string;
};

/** Pontos de pintura — cada um corresponde a uma categoria fotográfica obrigatória. */
export const PAINT_PARTS: PaintPart[] = [
  { code: "CAPO", number: "01", label: "Capô", photoCategory: "PINT_CAPO" },
  { code: "TETO", number: "02", label: "Teto pintura", photoCategory: "PINT_TETO" },
  { code: "TAMPA_PORTA_MALAS", number: "03", label: "Tampa do porta-malas", photoCategory: "PINT_TAMPA_PORTA_MALAS" },
  { code: "PARALAMA_DIANTEIRO_ESQUERDO", number: "04", label: "Paralama dianteiro esquerdo", photoCategory: "PINT_PARALAMA_DIANT_ESQ" },
  { code: "PORTA_DIANTEIRA_ESQUERDA", number: "05", label: "Porta dianteira esquerda", photoCategory: "PINT_PORTA_DIANT_ESQ" },
  { code: "PORTA_TRASEIRA_ESQUERDA", number: "06", label: "Porta traseira esquerda", photoCategory: "PINT_PORTA_TRASEIRA_ESQ" },
  { code: "TRASEIRA_ESQUERDA", number: "07", label: "Traseira esquerda", photoCategory: "PINT_LATERAL_TRASEIRA_ESQ" },
  { code: "TRASEIRA_DIREITA", number: "08", label: "Traseira direita", photoCategory: "PINT_LATERAL_TRASEIRA_DIR" },
  { code: "PORTA_TRASEIRA_DIREITA", number: "09", label: "Porta traseira direita", photoCategory: "PINT_PORTA_TRASEIRA_DIR" },
  { code: "PORTA_DIANTEIRA_DIREITA", number: "10", label: "Porta dianteira direita", photoCategory: "PINT_PORTA_DIANT_DIR" },
  { code: "PARALAMA_DIANTEIRO_DIREITO", number: "11", label: "Paralama dianteiro direito", photoCategory: "PINT_PARALAMA_DIANT_DIR" },
  { code: "PARACHOQUE_DIANTEIRO", number: "12", label: "Para-choque dianteiro", photoCategory: "PINT_PARACHOQUE_DIANTEIRO" },
  { code: "PARACHOQUE_TRASEIRO", number: "13", label: "Para-choque traseiro", photoCategory: "PINT_PARACHOQUE_TRASEIRO" },
];
