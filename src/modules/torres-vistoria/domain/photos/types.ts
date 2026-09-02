import type { LucideIcon } from "lucide-react";
import type { TechnicalIllustrationId } from "@/modules/torres-vistoria/domain/photos/illustrations/types";

export type PhotoCategoryType = "SINGLE" | "MULTI" | "DAMAGE" | "COMPLEMENTARY";

export type PhotoSectionStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "NEEDS_REVIEW";

export type PhotoCaptureStatus =
  | "PENDING"
  | "CAPTURED"
  | "UPLOADING"
  | "VALIDATED"
  | "NEEDS_RETAKE"
  | "REJECTED";

/** Visão do wireframe técnico do veículo. @deprecated Use TechnicalIllustrationId */
export type WireframeView =
  | "exterior_side"
  | "exterior_front"
  | "exterior_rear"
  | "exterior_top"
  | "engine"
  | "trunk"
  | "interior"
  | "wheel"
  | "document"
  | "detail";

/** Região destacada no wireframe (coordenadas em %). @deprecated Use highlightPartId */
export type WireframeHighlight = {
  x: number;
  y: number;
  width: number;
  height: number;
  rx?: number;
};

/** Posicionamento e orientação da câmera no guia técnico. */
export type CameraAngleGuide = {
  /** Rotação horizontal do aparelho (graus). */
  rotation: number;
  /** Inclinação vertical (graus). */
  tilt: number;
  /** Distância aproximada recomendada. */
  distance: string;
  /** Direção da seta em graus (0 = direita). */
  direction: number;
  /** Rótulo curto do alvo (ex.: "Longarina esq."). */
  targetLabel?: string;
};

export type PhotoTechnicalGuide = {
  illustrationId: TechnicalIllustrationId;
  highlightPartId: string;
  highlightLabel?: string;
  instruction: string;
  exampleImageUrl?: string | null;
  /** @deprecated Use illustrationId + highlightPartId */
  view?: WireframeView;
  highlight?: WireframeHighlight;
  camera?: CameraAngleGuide;
};

/** @deprecated Use PhotoTechnicalGuide */
export type PhotoVisualGuide = PhotoTechnicalGuide;

/** Status do card de guia na UI. */
export type PhotoGuideCardStatus = "pending" | "uploading" | "captured";

/**
 * Condição de visibilidade de seção/subseção/categoria.
 * - `armored`: exibido apenas quando o veículo é blindado.
 */
export type PhotoVisibilityCondition = "armored";

/** Contexto da vistoria usado para resolver visibilidade condicional. */
export type PhotoCaptureContext = {
  isArmored: boolean;
};

/** Subseção dentro de uma etapa — agrupa categorias com orientação própria. */
export type PhotoSubsectionDefinition = {
  key: string;
  name: string;
  description?: string;
  /** Orientação operacional exibida ao vistoriador. */
  guidance?: string;
  sortOrder: number;
  categories: PhotoCategoryDefinition[];
  visibleWhen?: PhotoVisibilityCondition;
};

export type PhotoCategoryDefinition = {
  key: string;
  sectionKey: string;
  /** Subseção à qual pertence, quando a etapa usa agrupamento interno. */
  subsectionKey?: string;
  name: string;
  description: string;
  icon: LucideIcon;
  sortOrder: number;
  required: boolean;
  minCount: number;
  maxCount: number;
  type: PhotoCategoryType;
  technicalGuide?: PhotoTechnicalGuide;
  /** @deprecated Use technicalGuide */
  visualGuide?: PhotoTechnicalGuide;
  /** Segundos estimados para captura — usado no cálculo de tempo restante. */
  estimatedCaptureSeconds?: number;
  visibleWhen?: PhotoVisibilityCondition;
};

/** Seção de evidências — agrupa categorias na UI e no PDF. */
export type PhotoSectionDefinition = {
  key: string;
  name: string;
  description: string;
  /** Orientação operacional destacada na etapa (ex.: quadros sem borracha). */
  guidance?: string;
  icon: LucideIcon;
  sortOrder: number;
  minRequiredCount: number;
  maxAllowedCount: number;
  /** Lista achatada — inclui todas as categorias para PDF e retrocompatibilidade. */
  categories: PhotoCategoryDefinition[];
  /** Agrupamento visual interno; quando presente, a UI prioriza subseções. */
  subsections?: PhotoSubsectionDefinition[];
  collapsible?: boolean;
  defaultOpen?: boolean;
  visibleWhen?: PhotoVisibilityCondition;
};

/** Progresso calculado de uma seção. */
export type PhotoSectionProgress = {
  sectionKey: string;
  status: PhotoSectionStatus;
  totalCategories: number;
  completedCategories: number;
  totalPhotos: number;
  requiredPhotos: number;
  completedPhotos: number;
  remainingPhotos: number;
  percentComplete: number;
  estimatedSecondsRemaining: number;
};

/** Progresso geral da captura. */
export type PhotoCaptureProgress = {
  sections: PhotoSectionProgress[];
  totalRequired: number;
  totalCompleted: number;
  percentComplete: number;
  estimatedSecondsRemaining: number;
  canProceed: boolean;
  missingRequiredLabels: string[];
};

/** Metadados estendidos de captura — persistidos no banco. */
export type PhotoCaptureMetadata = {
  sectionKey?: string | null;
  subcategory?: string | null;
  displayName?: string | null;
  sortOrder?: number;
  isRequired?: boolean;
  contentHash?: string | null;
  width?: number | null;
  height?: number | null;
  resolution?: string | null;
  gpsAccuracy?: number | null;
  capturedAt?: string | null;
  deviceModel?: string | null;
  deviceOs?: string | null;
  uploadedBy?: string | null;
  status?: PhotoCaptureStatus;
  damageLocation?: string | null;
  damageCategory?: string | null;
  damageSeverity?: string | null;
  complementaryName?: string | null;
  complementaryCategory?: string | null;
  aiValidation?: Record<string, unknown>;
};
