import { defineIllustration } from "@/lib/photos/illustrations/tokens";

/** Sedan — vista traseira técnica. */
export const vehicleRear = defineIllustration({
  id: "vehicle-rear",
  viewBox: "0 0 240 160",
  structure: [
    { id: "ground", d: "M 20 136 L 220 136", strokeWidth: 0.5 },
    { id: "wheel-left", d: "M 52 136 m -16 0 a 16 16 0 1 0 32 0 a 16 16 0 1 0 -32 0", strokeWidth: 0.45 },
    { id: "wheel-right", d: "M 188 136 m -16 0 a 16 16 0 1 0 32 0 a 16 16 0 1 0 -32 0", strokeWidth: 0.45 },
    { id: "taillight-left", d: "M 62 88 L 62 104 Q 62 108 66 108 L 78 108 Q 82 104 82 96 L 82 88 Z", strokeWidth: 0.5 },
    { id: "taillight-right", d: "M 178 88 L 178 96 Q 178 104 182 108 L 194 108 Q 198 108 198 104 L 198 88 Z", strokeWidth: 0.5 },
    { id: "trunk-crease", d: "M 120 48 L 120 88", strokeWidth: 0.4 },
    { id: "exhaust-left", d: "M 88 128 Q 90 132 92 128", strokeWidth: 0.45 },
    { id: "exhaust-right", d: "M 168 128 Q 170 132 172 128", strokeWidth: 0.45 },
  ],
  parts: [
    {
      id: "full-rear",
      label: "Traseira completa",
      d: "M 48 136 L 56 76 Q 60 52 80 40 L 120 32 L 160 40 Q 180 52 184 76 L 192 136 Z",
    },
    {
      id: "rear-left-45",
      label: "Traseira 45° esquerda",
      d: "M 48 136 L 56 76 Q 60 52 80 40 L 120 32 L 120 136 Z",
    },
    {
      id: "rear-right-45",
      label: "Traseira 45° direita",
      d: "M 192 136 L 184 76 Q 180 52 160 40 L 120 32 L 120 136 Z",
    },
    {
      id: "trunk-lid",
      label: "Tampa do porta-malas",
      d: "M 80 40 L 120 32 L 160 40 L 156 76 L 84 76 Z",
    },
    {
      id: "rear-bumper",
      label: "Para-choque traseiro",
      d: "M 56 112 L 184 112 L 192 136 L 48 136 Z",
    },
    {
      id: "rear-plate",
      label: "Placa traseira",
      d: "M 102 96 L 138 96 L 138 110 L 102 110 Z",
    },
    {
      id: "left-taillight",
      label: "Lanterna esquerda",
      d: "M 62 88 L 82 88 L 82 108 L 62 108 Z",
    },
    {
      id: "right-taillight",
      label: "Lanterna direita",
      d: "M 178 88 L 198 88 L 198 108 L 178 108 Z",
    },
  ],
});
