import type { TechnicalIllustrationDefinition } from "@/lib/photos/illustrations/types";

/** Tokens visuais — padrão único estilo manual automotivo (BMW/VW/Toyota EPC). */
export const ILLUSTRATION_TOKENS = {
  viewBox: "0 0 240 160",

  /** Painéis não destacados */
  panelFill: "#E8EDF3",
  panelStroke: "#A8B4C4",
  panelStrokeWidth: 0.75,

  /** Vidros e áreas secundárias */
  glassFill: "#D1D9E6",
  glassStroke: "#94A3B8",

  /** Linhas estruturais e detalhes */
  structureStroke: "#8B97A8",
  structureStrokeWidth: 0.6,
  structureMuted: "#C5CDD8",

  /** Pneus e borrachas */
  rubberFill: "#B8C2CE",
  rubberStroke: "#8896A8",

  /** Destaque da peça a fotografar — azul institucional */
  highlightFill: "#1E40AF",
  highlightFillOpacity: 0.38,
  highlightStroke: "#1E3A8A",
  highlightStrokeWidth: 1.1,

  /** Fundo do slot */
  background: "#F4F6F9",
} as const;

export function defineIllustration<T extends TechnicalIllustrationDefinition["id"]>(
  def: TechnicalIllustrationDefinition & { id: T },
): TechnicalIllustrationDefinition {
  return def;
}
