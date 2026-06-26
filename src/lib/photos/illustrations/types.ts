/** Identificador único de uma ilustração técnica mestre. */
export type TechnicalIllustrationId =
  | "vehicle-side-left"
  | "vehicle-side-right"
  | "vehicle-front"
  | "vehicle-rear"
  | "vehicle-top"
  | "engine-compartment"
  | "trunk-compartment"
  | "interior-cabin"
  | "wheel-assembly"
  | "document-sheet"
  | "door-structure"
  | "pillar-structure"
  | "identification-plate"
  | "windshield-glass"
  | "safety-equipment"
  | "damage-detail";

/** Traço de uma ilustração — linha técnica ou contorno de painel. */
export type IllustrationStroke = {
  id: string;
  d: string;
  strokeWidth?: number;
  opacity?: number;
};

/** Painel destacável — contorno real da peça (nunca retângulo/círculo genérico). */
export type IllustrationPart = {
  id: string;
  label: string;
  /** Contorno principal da peça — path fechado. */
  d: string;
  /** Detalhes internos opcionais (linhas de costura, gravação, etc.). */
  details?: IllustrationStroke[];
};

/** Definição completa de uma ilustração vetorial técnica. */
export type TechnicalIllustrationDefinition = {
  id: TechnicalIllustrationId;
  viewBox: string;
  /**
   * Silhueta base unificada — contorno reconhecível do veículo/componente.
   * Quando presente, a UI desenha UMA silhueta cinza e destaca só a peça alvo em azul.
   */
  silhouette?: string;
  /** Preenchimentos sobre a silhueta (vidros, rodas, áreas internas). */
  fills?: IllustrationStroke[];
  /** Linhas estruturais fixas (contornos, frisos, detalhes). */
  structure: IllustrationStroke[];
  /** Regiões destacáveis — cada uma com ID para animação/IA/AR futura. */
  parts: IllustrationPart[];
};

/** Referência de ilustração usada por uma categoria de foto. */
export type IllustrationReference = {
  illustrationId: TechnicalIllustrationId;
  highlightPartId: string;
};
