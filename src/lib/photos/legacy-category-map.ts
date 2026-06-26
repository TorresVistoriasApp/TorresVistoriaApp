/**
 * Mapeamento de categorias legadas (v1) para o novo catálogo modular (v2).
 * Garante retrocompatibilidade com fotos já capturadas.
 */
export const LEGACY_TO_NEW_CATEGORY: Record<string, string> = {
  FRENTE_45_ESQUERDA: "EXT_FRENTE_45_ESQ",
  FRENTE_45_DIREITA: "EXT_FRENTE_45_DIR",
  TRASEIRA_45_ESQUERDA: "EXT_TRASEIRA_45_ESQ",
  TRASEIRA_45_DIREITA: "EXT_TRASEIRA_45_DIR",
  LATERAL_ESQUERDA: "EXT_LATERAL_ESQ",
  LATERAL_DIREITA: "EXT_LATERAL_DIR",
  PLACA_DIANTEIRA: "EXT_PLACA_DIANTEIRA",
  PLACA_TRASEIRA: "EXT_PLACA_TRASEIRA",
  MOTOR: "MOT_COMPARTIMENTO",
  MOTOR_NUMERO: "MOT_NUMERO_MOTOR",
  CHASSI: "IDV_NUMERO_CHASSI",
  PAINEL: "INT_PAINEL_INSTRUMENTOS",
  HODOMETRO: "INT_HODOMETRO",
  ESTRUTURA_DIANTEIRA: "MOT_LONGARINA_DIANT_ESQ",
  ESTRUTURA_TRASEIRA: "TRS_LONGARINA_TRASEIRA_ESQ",
  CAIXA_AR: "LAT_CAIXA_AR_ESQ",
  ASSOALHO_PORTA_MALAS: "TRS_ASSOALHO_PORTA_MALAS",
  VIDROS: "IDV_GRAVACAO_VIDRO_LATERAL",
  ETIQUETAS: "IDV_ETIQUETA_COLUNA_DIR",
  INTERIOR: "INT_BANCOS_DIANTEIROS",
  CINTOS_AIRBAGS: "SEG_CINTO_DATA",
  DOCUMENTOS: "DOC_VEICULO",
  DANOS: "AVARIA",
  EXTRAS: "COMPLEMENTAR",
  PINTURA_CAPO: "PINT_CAPO",
  PINTURA_TETO: "PINT_TETO",
  PINTURA_TAMPA_PORTA_MALAS: "PINT_TAMPA_PORTA_MALAS",
  PINTURA_PARALAMA_DIANTEIRO_ESQUERDO: "PINT_PARALAMA_DIANT_ESQ",
  PINTURA_PORTA_DIANTEIRA_ESQUERDA: "PINT_PORTA_DIANT_ESQ",
  PINTURA_PORTA_TRASEIRA_ESQUERDA: "PINT_PORTA_TRASEIRA_ESQ",
  PINTURA_TRASEIRA_ESQUERDA: "PINT_LATERAL_TRASEIRA_ESQ",
  PINTURA_TRASEIRA_DIREITA: "PINT_LATERAL_TRASEIRA_DIR",
  PINTURA_PORTA_TRASEIRA_DIREITA: "PINT_PORTA_TRASEIRA_DIR",
  PINTURA_PORTA_DIANTEIRA_DIREITA: "PINT_PORTA_DIANT_DIR",
  PINTURA_PARALAMA_DIANTEIRO_DIREITO: "PINT_PARALAMA_DIANT_DIR",
  PINTURA_PARACHOQUE_DIANTEIRO: "PINT_PARACHOQUE_DIANTEIRO",
  PINTURA_PARACHOQUE_TRASEIRO: "PINT_PARACHOQUE_TRASEIRO",
};

/** Normaliza categoria legada ou nova para a chave canônica v2. */
export function normalizePhotoCategory(category: string): string {
  return LEGACY_TO_NEW_CATEGORY[category] ?? category;
}

/** Verifica se uma foto satisfaz uma categoria (considerando aliases legados). */
export function photoMatchesCategory(photoCategory: string, targetCategory: string): boolean {
  const normalizedPhoto = normalizePhotoCategory(photoCategory);
  const normalizedTarget = normalizePhotoCategory(targetCategory);
  if (normalizedPhoto === normalizedTarget) return true;

  if (photoCategory === "DOCUMENTOS" && targetCategory.startsWith("DOC_")) return true;
  if (photoCategory === "EXTRAS" && targetCategory === "COMPLEMENTAR") return true;
  if (photoCategory === "DANOS" && targetCategory === "AVARIA") return true;

  return false;
}

/** Exporta lista de categorias legadas para retrocompatibilidade. */
export const LEGACY_PHOTO_CATEGORIES = Object.keys(LEGACY_TO_NEW_CATEGORY);
