import { getCategoryIllustration } from "@/lib/photos/illustrations/catalog";
import type {
  CameraAngleGuide,
  PhotoTechnicalGuide,
  WireframeView,
} from "@/lib/photos/types";

type GuideInput = {
  view: WireframeView;
  highlight: { x: number; y: number; width: number; height: number; rx?: number };
  highlightLabel?: string;
  instruction: string;
  camera?: Partial<CameraAngleGuide>;
  exampleImageUrl?: string | null;
};

const DEFAULT_CAMERA: Record<WireframeView, CameraAngleGuide> = {
  exterior_side: { rotation: 0, tilt: 0, distance: "~3 m", direction: 90, targetLabel: "Lateral" },
  exterior_front: { rotation: -15, tilt: 5, distance: "~2 m", direction: 0, targetLabel: "Frente" },
  exterior_rear: { rotation: 15, tilt: 5, distance: "~2 m", direction: 180, targetLabel: "Traseira" },
  exterior_top: { rotation: 0, tilt: -20, distance: "~1,5 m", direction: -90, targetLabel: "Superior" },
  engine: { rotation: 0, tilt: 35, distance: "~50 cm", direction: -90, targetLabel: "Compartimento" },
  trunk: { rotation: 0, tilt: 30, distance: "~60 cm", direction: 0, targetLabel: "Porta-malas" },
  interior: { rotation: 0, tilt: 10, distance: "~40 cm", direction: 0, targetLabel: "Interior" },
  wheel: { rotation: -20, tilt: 15, distance: "~80 cm", direction: 45, targetLabel: "Roda" },
  document: { rotation: 0, tilt: 0, distance: "~30 cm", direction: -90, targetLabel: "Documento" },
  detail: { rotation: 0, tilt: 20, distance: "~50 cm", direction: 0, targetLabel: "Detalhe" },
};

/** Factory para guias técnicos padronizados. */
export function createTechnicalGuide(input: GuideInput): PhotoTechnicalGuide {
  const defaults = DEFAULT_CAMERA[input.view];
  return {
    illustrationId: "damage-detail",
    highlightPartId: "component-area",
    highlight: input.highlight,
    highlightLabel: input.highlightLabel,
    instruction: input.instruction,
    exampleImageUrl: input.exampleImageUrl ?? null,
    view: input.view,
    camera: {
      rotation: input.camera?.rotation ?? defaults.rotation,
      tilt: input.camera?.tilt ?? defaults.tilt,
      distance: input.camera?.distance ?? defaults.distance,
      direction: input.camera?.direction ?? defaults.direction,
      targetLabel: input.camera?.targetLabel ?? input.highlightLabel ?? defaults.targetLabel,
    },
    future: {},
  };
}

/** Guias técnicos indexados por chave de categoria. */
export const TECHNICAL_GUIDES: Record<string, PhotoTechnicalGuide> = {
  EXT_FRENTE_45_ESQ: createTechnicalGuide({
    view: "exterior_front",
    highlight: { x: 6, y: 26, width: 42, height: 46 },
    highlightLabel: "45° ESQ",
    instruction:
      "Posicione-se a aproximadamente 2 m, no ângulo frontal esquerdo, incluindo placa dianteira e lateral esquerda sem cortes.",
    camera: { rotation: -25, tilt: 5, direction: -25, targetLabel: "Frente esq." },
  }),
  EXT_FRENTE_45_DIR: createTechnicalGuide({
    view: "exterior_front",
    highlight: { x: 52, y: 26, width: 42, height: 46 },
    highlightLabel: "45° DIR",
    instruction:
      "Posicione-se a aproximadamente 2 m, no ângulo frontal direito, incluindo placa dianteira e lateral direita sem cortes.",
    camera: { rotation: 25, tilt: 5, direction: 25, targetLabel: "Frente dir." },
  }),
  EXT_FRENTE_COMPLETA: createTechnicalGuide({
    view: "exterior_front",
    highlight: { x: 20, y: 16, width: 60, height: 58 },
    highlightLabel: "FRENTE",
    instruction: "Centralize a frente completa do veículo, com capô, para-choque e faróis totalmente visíveis.",
  }),
  EXT_LATERAL_ESQ: createTechnicalGuide({
    view: "exterior_side",
    highlight: { x: 4, y: 20, width: 92, height: 54 },
    highlightLabel: "LATERAL ESQ",
    instruction: "Afaste-se cerca de 3 m e capture toda a lateral esquerda, da roda dianteira à traseira, sem inclinar o celular.",
  }),
  EXT_LATERAL_DIR: createTechnicalGuide({
    view: "exterior_side",
    highlight: { x: 4, y: 20, width: 92, height: 54 },
    highlightLabel: "LATERAL DIR",
    instruction: "Afaste-se cerca de 3 m e capture toda a lateral direita, mantendo o veículo paralelo ao enquadramento.",
  }),
  MOT_LONGARINA_DIANT_ESQ: createTechnicalGuide({
    view: "engine",
    highlight: { x: 6, y: 34, width: 30, height: 42 },
    highlightLabel: "LONGARINA",
    instruction:
      "Posicione a câmera a aproximadamente 50 cm da longarina dianteira esquerda, mantendo toda a peça visível incluindo pontos de solda.",
    camera: { rotation: -10, tilt: 40, distance: "~50 cm", direction: -70, targetLabel: "Longarina esq." },
  }),
  MOT_LONGARINA_DIANT_DIR: createTechnicalGuide({
    view: "engine",
    highlight: { x: 64, y: 34, width: 30, height: 42 },
    highlightLabel: "LONGARINA",
    instruction:
      "Posicione a câmera a aproximadamente 50 cm da longarina dianteira direita, com iluminação uniforme e foco nítido.",
    camera: { rotation: 10, tilt: 40, distance: "~50 cm", direction: -110, targetLabel: "Longarina dir." },
  }),
  MOT_TORRE_AMORT_ESQ: createTechnicalGuide({
    view: "engine",
    highlight: { x: 8, y: 28, width: 28, height: 36 },
    highlightLabel: "TORRE",
    instruction:
      "Fotografe a torre do amortecedor esquerda incluindo o paralama interno e evitando cortes na imagem.",
    camera: { tilt: 35, distance: "~45 cm", targetLabel: "Torre esq." },
  }),
  MOT_PAINEL_CORTA_FOGO: createTechnicalGuide({
    view: "engine",
    highlight: { x: 38, y: 38, width: 24, height: 32 },
    highlightLabel: "CORTA-FOGO",
    instruction:
      "Centralize o painel corta-fogo com fixações visíveis. Mantenha distância de ~50 cm e evite reflexos.",
    camera: { tilt: 30, distance: "~50 cm", targetLabel: "Corta-fogo" },
  }),
  TRS_CAIXA_ESTEPE: createTechnicalGuide({
    view: "trunk",
    highlight: { x: 28, y: 46, width: 44, height: 28 },
    highlightLabel: "ESTEPE",
    instruction:
      "Com o porta-malas aberto, fotografe a caixa de estepe incluindo assoalho e fixações originais.",
    camera: { tilt: 25, distance: "~60 cm", direction: -90, targetLabel: "Caixa estepe" },
  }),
  IDV_NUMERO_CHASSI: createTechnicalGuide({
    view: "detail",
    highlight: { x: 18, y: 38, width: 64, height: 24 },
    highlightLabel: "CHASSI",
    instruction:
      "Centralize completamente o número do chassi e garanta perfeita legibilidade de todos os caracteres.",
    camera: { tilt: 15, distance: "~25 cm", direction: -90, targetLabel: "Numeração" },
  }),
  IDV_NUMERO_MOTOR: createTechnicalGuide({
    view: "engine",
    highlight: { x: 28, y: 52, width: 44, height: 22 },
    highlightLabel: "MOTOR",
    instruction:
      "Fotografe a gravação do motor sem obstruções, com foco nítido e iluminação direta sobre os caracteres.",
    camera: { tilt: 35, distance: "~30 cm", targetLabel: "Nº motor" },
  }),
  INT_HODOMETRO: createTechnicalGuide({
    view: "interior",
    highlight: { x: 26, y: 28, width: 48, height: 30 },
    highlightLabel: "HODÔMETRO",
    instruction:
      "Com a ignição ligada, centralize o hodômetro e garanta que a quilometragem esteja perfeitamente legível.",
    camera: { tilt: 10, distance: "~40 cm", targetLabel: "Quilometragem" },
  }),
  EXT_PLACA_DIANTEIRA: createTechnicalGuide({
    view: "exterior_front",
    highlight: { x: 28, y: 56, width: 44, height: 18 },
    highlightLabel: "PLACA",
    instruction: "Aproxime-se a ~40 cm da placa dianteira. Todos os caracteres devem estar nítidos e sem reflexo.",
    camera: { distance: "~40 cm", tilt: 0, targetLabel: "Placa diant." },
  }),
  DOC_CRLV: createTechnicalGuide({
    view: "document",
    highlight: { x: 12, y: 16, width: 76, height: 68 },
    highlightLabel: "CRLV",
    instruction:
      "Apoie o documento em superfície plana, evite sombras e mantenha o texto inteiro legível no enquadramento.",
    camera: { tilt: 0, distance: "~30 cm", direction: -90, targetLabel: "Documento" },
  }),
  AVARIA: createTechnicalGuide({
    view: "detail",
    highlight: { x: 18, y: 22, width: 64, height: 56 },
    highlightLabel: "AVARIA",
    instruction:
      "Aproxime a avaria preenchendo o quadro, mantendo contexto suficiente para identificar localização e extensão.",
    camera: { distance: "~40 cm", tilt: 10, targetLabel: "Dano" },
  }),
};

export function getTechnicalGuide(categoryKey: string): PhotoTechnicalGuide | undefined {
  return TECHNICAL_GUIDES[categoryKey];
}

export function getDefaultTechnicalGuide(categoryName: string): PhotoTechnicalGuide {
  return createTechnicalGuide({
    view: "detail",
    highlight: { x: 18, y: 22, width: 64, height: 56 },
    highlightLabel: "ÁREA",
    instruction: `Posicione a câmera a aproximadamente 50 cm, mantendo ${categoryName.toLowerCase()} totalmente visível e com foco nítido.`,
    camera: { targetLabel: categoryName.slice(0, 12) },
  });
}

export function resolveTechnicalGuide(categoryKey: string, categoryName: string): PhotoTechnicalGuide {
  const guide = getTechnicalGuide(categoryKey) ?? getDefaultTechnicalGuide(categoryName);
  const illustration = getCategoryIllustration(categoryKey);
  return {
    ...guide,
    illustrationId: illustration.illustrationId,
    highlightPartId: illustration.highlightPartId,
  };
}

/** Retrocompatibilidade */
export const createVisualGuide = createTechnicalGuide;
export const VISUAL_GUIDES = TECHNICAL_GUIDES;
export const getVisualGuide = getTechnicalGuide;
export const getDefaultVisualGuide = getDefaultTechnicalGuide;
export const resolveVisualGuide = resolveTechnicalGuide;
