import type { LucideIcon } from "lucide-react";

/** Tipo de slot de captura — preparado para regras distintas por categoria. */
export type PhotoCategoryType = "SINGLE" | "MULTI" | "DAMAGE" | "COMPLEMENTARY";

/** Status operacional de uma seção durante a captura. */
export type PhotoSectionStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "NEEDS_REVIEW";

/** Status de uma fotografia individual — extensível para validação por IA. */
export type PhotoCaptureStatus =
  | "PENDING"
  | "CAPTURED"
  | "UPLOADING"
  | "VALIDATED"
  | "NEEDS_RETAKE"
  | "REJECTED";

/** Visão do wireframe técnico do veículo. */
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

/** Região destacada no wireframe (coordenadas em %). */
export type WireframeHighlight = {
  x: number;
  y: number;
  width: number;
  height: number;
  rx?: number;
};

/** Configuração do guia visual inteligente por categoria. */
export type PhotoVisualGuide = {
  view: WireframeView;
  highlight: WireframeHighlight;
  arrowAngle?: number;
  instruction: string;
  exampleImageUrl?: string;
};

/** Categoria configurável — futuramente carregada do banco (SaaS). */
export type PhotoCategoryDefinition = {
  key: string;
  sectionKey: string;
  name: string;
  description: string;
  icon: LucideIcon;
  sortOrder: number;
  required: boolean;
  minCount: number;
  maxCount: number;
  type: PhotoCategoryType;
  visualGuide?: PhotoVisualGuide;
  /** Segundos estimados para captura — usado no cálculo de tempo restante. */
  estimatedCaptureSeconds?: number;
};

/** Seção de evidências — agrupa categorias na UI e no PDF. */
export type PhotoSectionDefinition = {
  key: string;
  name: string;
  description: string;
  icon: LucideIcon;
  sortOrder: number;
  minRequiredCount: number;
  maxAllowedCount: number;
  categories: PhotoCategoryDefinition[];
  collapsible?: boolean;
  defaultOpen?: boolean;
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
