import type { PhotoVisualGuide, WireframeView } from "@/lib/photos/types";

type GuideInput = {
  view: WireframeView;
  highlight: { x: number; y: number; width: number; height: number; rx?: number };
  instruction: string;
  arrowAngle?: number;
};

/** Factory para guias visuais padronizados. */
export function createVisualGuide(input: GuideInput): PhotoVisualGuide {
  return {
    view: input.view,
    highlight: input.highlight,
    arrowAngle: input.arrowAngle,
    instruction: input.instruction,
  };
}

/** Guias visuais indexados por chave de categoria. */
export const VISUAL_GUIDES: Record<string, PhotoVisualGuide> = {
  EXT_FRENTE_45_ESQ: createVisualGuide({
    view: "exterior_front",
    highlight: { x: 8, y: 28, width: 38, height: 44 },
    arrowAngle: -35,
    instruction: "Posicione-se à frente esquerda do veículo, a ~2 m, inclinando levemente o celular para capturar placa e lateral.",
  }),
  EXT_FRENTE_45_DIR: createVisualGuide({
    view: "exterior_front",
    highlight: { x: 54, y: 28, width: 38, height: 44 },
    arrowAngle: 35,
    instruction: "Posicione-se à frente direita do veículo, mantendo placa dianteira e lateral visíveis no enquadramento.",
  }),
  EXT_FRENTE_COMPLETA: createVisualGuide({
    view: "exterior_front",
    highlight: { x: 22, y: 18, width: 56, height: 58 },
    instruction: "Centralize a frente do veículo no quadro, com para-choque e capô totalmente visíveis.",
  }),
  EXT_LATERAL_ESQ: createVisualGuide({
    view: "exterior_side",
    highlight: { x: 6, y: 22, width: 88, height: 52 },
    instruction: "Afaste-se lateralmente (~3 m) e capture toda a lateral esquerda, da roda dianteira à traseira.",
  }),
  EXT_LATERAL_DIR: createVisualGuide({
    view: "exterior_side",
    highlight: { x: 6, y: 22, width: 88, height: 52 },
    instruction: "Capture a lateral direita completa, mantendo o veículo paralelo ao celular.",
  }),
  EXT_TRASEIRA_45_ESQ: createVisualGuide({
    view: "exterior_rear",
    highlight: { x: 8, y: 30, width: 38, height: 42 },
    arrowAngle: -35,
    instruction: "Posicione-se na traseira esquerda em ângulo de 45°, incluindo placa traseira e lateral.",
  }),
  EXT_TRASEIRA_45_DIR: createVisualGuide({
    view: "exterior_rear",
    highlight: { x: 54, y: 30, width: 38, height: 42 },
    arrowAngle: 35,
    instruction: "Posicione-se na traseira direita em ângulo de 45°, com placa e lateral visíveis.",
  }),
  EXT_TRASEIRA_COMPLETA: createVisualGuide({
    view: "exterior_rear",
    highlight: { x: 20, y: 20, width: 60, height: 56 },
    instruction: "Centralize a traseira do veículo, incluindo para-choque traseiro e tampa do porta-malas.",
  }),
  EXT_PLACA_DIANTEIRA: createVisualGuide({
    view: "exterior_front",
    highlight: { x: 30, y: 58, width: 40, height: 18 },
    instruction: "Aproxime-se da placa dianteira até que todos os caracteres fiquem nítidos e legíveis.",
  }),
  EXT_PLACA_TRASEIRA: createVisualGuide({
    view: "exterior_rear",
    highlight: { x: 30, y: 58, width: 40, height: 18 },
    instruction: "Fotografe a placa traseira de frente, sem reflexos, com lacre visível quando aplicável.",
  }),
  EXT_LACRE_PLACA: createVisualGuide({
    view: "detail",
    highlight: { x: 25, y: 35, width: 50, height: 30 },
    instruction: "Aproxime o foco no lacre da placa traseira, garantindo nitidez dos detalhes.",
  }),
  MOT_LONGARINA_DIANT_ESQ: createVisualGuide({
    view: "engine",
    highlight: { x: 8, y: 35, width: 28, height: 40 },
    instruction: "Com o capô aberto, fotografe a longarina dianteira esquerda incluindo pontos de solda originais.",
  }),
  MOT_LONGARINA_DIANT_DIR: createVisualGuide({
    view: "engine",
    highlight: { x: 64, y: 35, width: 28, height: 40 },
    instruction: "Fotografe a longarina dianteira direita com boa iluminação natural ou lanterna.",
  }),
  IDV_NUMERO_CHASSI: createVisualGuide({
    view: "detail",
    highlight: { x: 20, y: 40, width: 60, height: 22 },
    instruction: "Localize a gravação do chassi e aproxime até que todos os caracteres estejam legíveis.",
  }),
  IDV_NUMERO_MOTOR: createVisualGuide({
    view: "engine",
    highlight: { x: 30, y: 55, width: 40, height: 20 },
    instruction: "Fotografe a numeração do motor sem obstruções, com foco nítido nos caracteres.",
  }),
  INT_HODOMETRO: createVisualGuide({
    view: "interior",
    highlight: { x: 28, y: 30, width: 44, height: 28 },
    instruction: "Ligue a ignição e fotografe o hodômetro com quilometragem claramente visível.",
  }),
  ROD_DIANT_ESQ: createVisualGuide({
    view: "wheel",
    highlight: { x: 18, y: 18, width: 64, height: 64, rx: 50 },
    instruction: "Fotografe a roda dianteira esquerda incluindo pneu, aro e estado geral.",
  }),
  DOC_CRLV: createVisualGuide({
    view: "document",
    highlight: { x: 15, y: 20, width: 70, height: 60 },
    instruction: "Apoie o documento em superfície plana, evite sombras e mantenha o texto legível.",
  }),
  AVARIA: createVisualGuide({
    view: "detail",
    highlight: { x: 20, y: 25, width: 60, height: 50 },
    instruction: "Aproxime a avaria preenchendo o quadro, garantindo contexto suficiente para identificação.",
  }),
};

export function getVisualGuide(categoryKey: string): PhotoVisualGuide | undefined {
  return VISUAL_GUIDES[categoryKey];
}

/** Guia genérico para categorias sem configuração específica. */
export function getDefaultVisualGuide(categoryName: string): PhotoVisualGuide {
  return createVisualGuide({
    view: "detail",
    highlight: { x: 20, y: 25, width: 60, height: 50 },
    instruction: `Posicione o celular de forma estável e capture ${categoryName.toLowerCase()} com boa iluminação e foco nítido.`,
  });
}

export function resolveVisualGuide(categoryKey: string, categoryName: string): PhotoVisualGuide {
  return getVisualGuide(categoryKey) ?? getDefaultVisualGuide(categoryName);
}
