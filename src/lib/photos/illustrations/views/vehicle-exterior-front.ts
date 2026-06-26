import { defineIllustration } from "@/lib/photos/illustrations/tokens";

/** Sedan — vista frontal técnica. */
export const vehicleFront = defineIllustration({
  id: "vehicle-front",
  viewBox: "0 0 240 160",
  structure: [
    { id: "ground", d: "M 20 136 L 220 136", strokeWidth: 0.5 },
    { id: "grille-lines", d: "M 96 96 L 96 112 M 104 96 L 104 112 M 112 96 L 112 112 M 120 96 L 120 112 M 128 96 L 128 112 M 136 96 L 136 112 M 144 96 L 144 112", strokeWidth: 0.35 },
    { id: "headlight-left", d: "M 58 88 L 58 104 Q 58 108 62 108 L 74 108 Q 78 104 78 96 L 78 88 Z", strokeWidth: 0.5 },
    { id: "headlight-right", d: "M 182 88 L 182 96 Q 182 104 186 108 L 198 108 Q 202 108 202 104 L 202 88 Z", strokeWidth: 0.5 },
    { id: "wheel-left", d: "M 52 136 m -16 0 a 16 16 0 1 0 32 0 a 16 16 0 1 0 -32 0 M 52 136 m -8 0 a 8 8 0 1 0 16 0 a 8 8 0 1 0 -16 0", strokeWidth: 0.45 },
    { id: "wheel-right", d: "M 188 136 m -16 0 a 16 16 0 1 0 32 0 a 16 16 0 1 0 -32 0 M 188 136 m -8 0 a 8 8 0 1 0 16 0 a 8 8 0 1 0 -16 0", strokeWidth: 0.45 },
    { id: "hood-crease", d: "M 120 52 L 120 88", strokeWidth: 0.4 },
    { id: "fog-left", d: "M 68 112 L 76 112 L 76 118 L 68 118 Z", strokeWidth: 0.35 },
    { id: "fog-right", d: "M 164 112 L 172 112 L 172 118 L 164 118 Z", strokeWidth: 0.35 },
  ],
  parts: [
    {
      id: "full-front",
      label: "Frente completa",
      d: "M 48 136 L 56 72 Q 60 48 80 36 L 120 28 L 160 36 Q 180 48 184 72 L 192 136 Z",
    },
    {
      id: "front-left-45",
      label: "Frente 45° esquerda",
      d: "M 48 136 L 56 72 Q 60 48 80 36 L 120 28 L 120 136 Z",
    },
    {
      id: "front-right-45",
      label: "Frente 45° direita",
      d: "M 192 136 L 184 72 Q 180 48 160 36 L 120 28 L 120 136 Z",
    },
    {
      id: "hood",
      label: "Capô",
      d: "M 80 36 L 120 28 L 160 36 L 156 72 L 84 72 Z",
    },
    {
      id: "front-bumper",
      label: "Para-choque dianteiro",
      d: "M 56 112 L 184 112 L 192 136 L 48 136 Z",
    },
    {
      id: "grille",
      label: "Grade",
      d: "M 88 88 L 152 88 L 152 112 L 88 112 Z",
    },
    {
      id: "front-plate",
      label: "Placa dianteira",
      d: "M 102 114 L 138 114 L 138 128 L 102 128 Z",
    },
    {
      id: "left-headlight",
      label: "Farol esquerdo",
      d: "M 58 88 L 78 88 L 78 108 L 58 108 Z",
    },
    {
      id: "right-headlight",
      label: "Farol direito",
      d: "M 182 88 L 202 88 L 202 108 L 182 108 Z",
    },
    {
      id: "left-fender",
      label: "Para-lama esquerdo",
      d: "M 48 136 L 56 112 L 56 88 L 68 88 L 72 112 L 72 136 Z",
    },
    {
      id: "right-fender",
      label: "Para-lama direito",
      d: "M 192 136 L 184 112 L 184 88 L 172 88 L 168 112 L 168 136 Z",
    },
  ],
});
