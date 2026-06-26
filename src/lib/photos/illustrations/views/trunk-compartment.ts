import { defineIllustration } from "@/lib/photos/illustrations/tokens";

/** Porta-malas aberto — silhueta. */
export const trunkCompartment = defineIllustration({
  id: "trunk-compartment",
  viewBox: "0 0 240 160",
  silhouette: "M 28 32 L 28 132 L 212 132 L 212 32 L 120 16 Z",
  fills: [
    { id: "spare-well", d: "M 88 88 L 152 88 L 152 118 L 88 118 Z" },
  ],
  structure: [
    { id: "lid", d: "M 28 32 L 120 16 L 212 32", strokeWidth: 0.55 },
    { id: "floor-a", d: "M 48 72 L 192 72", strokeWidth: 0.4 },
    { id: "floor-b", d: "M 48 96 L 192 96", strokeWidth: 0.35 },
  ],
  parts: [
    { id: "trunk-open", label: "Porta-malas aberto", d: "M 28 32 L 212 32 L 212 132 L 28 132 Z" },
    { id: "upper-panel", label: "Painel traseiro superior", d: "M 48 32 L 192 32 L 192 56 L 48 56 Z" },
    { id: "lower-panel", label: "Painel traseiro inferior", d: "M 48 56 L 192 56 L 192 72 L 48 72 Z" },
    { id: "longeron-left", label: "Longarina traseira esquerda", d: "M 28 72 L 56 72 L 56 132 L 28 132 Z" },
    { id: "longeron-right", label: "Longarina traseira direita", d: "M 184 72 L 212 72 L 212 132 L 184 132 Z" },
    { id: "floor-panel", label: "Assoalho", d: "M 48 72 L 192 72 L 192 132 L 48 132 Z" },
    { id: "spare-well", label: "Caixa de estepe", d: "M 88 88 L 152 88 L 152 118 L 88 118 Z" },
    { id: "trunk-floor", label: "Assoalho do porta-malas", d: "M 56 96 L 184 96 L 184 124 L 56 124 Z" },
  ],
});
