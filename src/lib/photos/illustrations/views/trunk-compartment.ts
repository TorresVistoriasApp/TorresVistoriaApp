import { defineIllustration } from "@/lib/photos/illustrations/tokens";

/** Porta-malas aberto — estrutura traseira. */
export const trunkCompartment = defineIllustration({
  id: "trunk-compartment",
  viewBox: "0 0 240 160",
  structure: [
    { id: "outer-frame", d: "M 32 24 L 32 136 L 208 136 L 208 24", strokeWidth: 0.55 },
    { id: "lid-open", d: "M 32 24 L 120 8 L 208 24", strokeWidth: 0.5 },
    { id: "wheel-well-left", d: "M 48 108 Q 48 96 56 92", strokeWidth: 0.4 },
    { id: "wheel-well-right", d: "M 192 108 Q 192 96 184 92", strokeWidth: 0.4 },
    { id: "spare-well", d: "M 88 88 L 152 88 L 152 120 L 88 120 Z", strokeWidth: 0.45 },
    { id: "trunk-floor-lines", d: "M 48 72 L 192 72 M 48 96 L 192 96", strokeWidth: 0.35 },
  ],
  parts: [
    {
      id: "trunk-open",
      label: "Porta-malas aberto",
      d: "M 32 24 L 208 24 L 208 136 L 32 136 Z",
    },
    {
      id: "upper-panel",
      label: "Painel traseiro superior",
      d: "M 48 24 L 192 24 L 192 56 L 48 56 Z",
    },
    {
      id: "lower-panel",
      label: "Painel traseiro inferior",
      d: "M 48 56 L 192 56 L 192 72 L 48 72 Z",
    },
    {
      id: "longeron-left",
      label: "Longarina traseira esquerda",
      d: "M 32 72 L 56 72 L 56 136 L 32 136 Z",
    },
    {
      id: "longeron-right",
      label: "Longarina traseira direita",
      d: "M 184 72 L 208 72 L 208 136 L 184 136 Z",
    },
    {
      id: "floor-panel",
      label: "Assoalho",
      d: "M 48 72 L 192 72 L 192 136 L 48 136 Z",
    },
    {
      id: "spare-well",
      label: "Caixa de estepe",
      d: "M 88 88 L 152 88 L 152 120 L 88 120 Z",
    },
    {
      id: "trunk-floor",
      label: "Assoalho do porta-malas",
      d: "M 56 96 L 184 96 L 184 128 L 56 128 Z",
    },
  ],
});
