import { defineIllustration } from "@/lib/photos/illustrations/tokens";

/** Quadro de porta — estrutura lateral. */
export const doorStructure = defineIllustration({
  id: "door-structure",
  viewBox: "0 0 240 160",
  structure: [
    { id: "outer-frame", d: "M 48 20 L 48 140 L 192 140 L 192 20 Z", strokeWidth: 0.55 },
    { id: "inner-frame", d: "M 64 36 L 64 124 L 176 124 L 176 36 Z", strokeWidth: 0.45 },
    { id: "hinge-top", d: "M 48 36 L 56 36 L 56 48 L 48 48 Z", strokeWidth: 0.4 },
    { id: "hinge-bottom", d: "M 48 112 L 56 112 L 56 124 L 48 124 Z", strokeWidth: 0.4 },
    { id: "latch", d: "M 180 76 L 188 76 L 188 84 L 180 84 Z", strokeWidth: 0.4 },
    { id: "seal-channel", d: "M 64 36 L 176 36 M 64 124 L 176 124", strokeWidth: 0.35 },
    { id: "reinforcement", d: "M 80 52 L 160 52 L 160 108 L 80 108 Z", strokeWidth: 0.35 },
  ],
  parts: [
    {
      id: "door-frame",
      label: "Quadro da porta",
      d: "M 64 36 L 176 36 L 176 124 L 64 124 Z",
    },
    {
      id: "front-door-frame-left",
      label: "Quadro porta dianteira esquerda",
      d: "M 64 36 L 176 36 L 176 124 L 64 124 Z",
    },
    {
      id: "rear-door-frame-left",
      label: "Quadro porta traseira esquerda",
      d: "M 64 36 L 176 36 L 176 124 L 64 124 Z",
    },
    {
      id: "front-door-frame-right",
      label: "Quadro porta dianteira direita",
      d: "M 64 36 L 176 36 L 176 124 L 64 124 Z",
    },
    {
      id: "rear-door-frame-right",
      label: "Quadro porta traseira direita",
      d: "M 64 36 L 176 36 L 176 124 L 64 124 Z",
    },
    {
      id: "rocker-left",
      label: "Caixa de ar esquerda",
      d: "M 48 124 L 192 124 L 192 140 L 48 140 Z",
    },
    {
      id: "rocker-right",
      label: "Caixa de ar direita",
      d: "M 48 124 L 192 124 L 192 140 L 48 140 Z",
    },
  ],
});
