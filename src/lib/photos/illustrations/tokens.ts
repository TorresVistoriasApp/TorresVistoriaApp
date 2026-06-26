import type { TechnicalIllustrationDefinition } from "@/lib/photos/illustrations/types";

/** Tokens visuais — silhueta automotiva profissional (estilo catálogo / Shutterstock técnico). */
export const ILLUSTRATION_TOKENS = {
  viewBox: "0 0 240 160",

  /** Silhueta base do veículo */
  silhouetteFill: "#8B95A5",
  silhouetteStroke: "#2D3748",
  silhouetteStrokeWidth: 1.35,

  /** Vidros e recortes */
  glassFill: "#D8DEE8",
  glassStroke: "#64748B",

  /** Rodas / pneus na silhueta */
  wheelFill: "#5C6573",
  wheelStroke: "#2D3748",
  wheelStrokeWidth: 1,

  /** Linhas de detalhe (portas, frisos) */
  structureStroke: "#374151",
  structureStrokeWidth: 0.65,
  structureMuted: "#94A3B8",

  /** Destaque da peça a fotografar */
  highlightFill: "#1E40AF",
  highlightFillOpacity: 0.72,
  highlightStroke: "#1E3A8A",
  highlightStrokeWidth: 1.25,

  /** Fundo do slot */
  background: "#EEF1F5",

  /** Fallback modo legado (sem silhueta) */
  panelFill: "#C5CDD8",
  panelStroke: "#64748B",
  panelStrokeWidth: 0.75,
  rubberFill: "#5C6573",
  rubberStroke: "#374151",
} as const;

export function defineIllustration<T extends TechnicalIllustrationDefinition["id"]>(
  def: TechnicalIllustrationDefinition & { id: T },
): TechnicalIllustrationDefinition {
  return def;
}
