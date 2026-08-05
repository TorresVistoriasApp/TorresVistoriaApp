/** Categorias opcionais da etapa Fotos extras (itens do veículo). */
export const FOTOS_EXTRAS_ITEM_KEYS = [
  "EXTRA_CHAVE_PRINCIPAL",
  "EXTRA_CHAVE_RESERVA",
  "EXTRA_MANUAL_PROPRIETARIO",
  "EXTRA_ESTEPE",
  "EXTRA_RODAS",
  "EXTRA_PNEUS_ESTADO",
  "EXTRA_CHAVE_RODA",
  "EXTRA_MACACO",
  "EXTRA_TRIANGULO",
] as const;

/** Categorias da subseção Blindagem (visível apenas para veículos blindados). */
export const FOTOS_EXTRAS_BLINDAGEM_KEYS = [
  "BLIND_VIDRO_DIANT_ESQ",
  "BLIND_VIDRO_DIANT_DIR",
  "BLIND_ESPESSURA_VIDRO",
  "BLIND_MARCA_VIDRO",
  "BLIND_DOC_AUTORIZACAO",
] as const;

export const FOTOS_EXTRAS_COMPLEMENTAR_KEY = "COMPLEMENTAR" as const;

export const FOTOS_EXTRAS_SUBSECTION_KEYS = {
  ITENS: "EXTRAS_ITENS",
  BLINDAGEM: "EXTRAS_BLINDAGEM",
} as const;

export type FotosExtrasItemKey = (typeof FOTOS_EXTRAS_ITEM_KEYS)[number];
export type FotosExtrasBlindagemKey = (typeof FOTOS_EXTRAS_BLINDAGEM_KEYS)[number];
