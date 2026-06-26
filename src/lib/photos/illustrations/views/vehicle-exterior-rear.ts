import { defineIllustration } from "@/lib/photos/illustrations/tokens";
import { SEDAN_REAR_BODY } from "@/lib/photos/illustrations/silhouette-paths";

/** Sedan — vista traseira em silhueta. */
export const vehicleRear = defineIllustration({
  id: "vehicle-rear",
  viewBox: "0 0 240 160",
  silhouette: SEDAN_REAR_BODY,
  fills: [
    { id: "rear-glass", d: "M 72 50 L 120 38 L 168 50 L 148 70 L 92 70 Z" },
    { id: "wheel-l", d: "M 52 128 m -14 0 a 14 14 0 1 0 28 0 a 14 14 0 1 0 -28 0" },
    { id: "wheel-r", d: "M 188 128 m -14 0 a 14 14 0 1 0 28 0 a 14 14 0 1 0 -28 0" },
  ],
  structure: [
    { id: "ground", d: "M 20 136 L 220 136", strokeWidth: 0.55, opacity: 0.45 },
    { id: "trunk-line", d: "M 120 38 L 120 88", strokeWidth: 0.45 },
    { id: "tl-l", d: "M 58 84 L 78 84 L 78 106 L 58 106 Z", strokeWidth: 0.5 },
    { id: "tl-r", d: "M 162 84 L 182 84 L 182 106 L 162 106 Z", strokeWidth: 0.5 },
  ],
  parts: [
    { id: "full-rear", label: "Traseira completa", d: SEDAN_REAR_BODY },
    { id: "rear-left-45", label: "Traseira 45° esquerda", d: "M 44 128 L 52 74 C 56 50 76 34 120 28 L 120 128 Z" },
    { id: "rear-right-45", label: "Traseira 45° direita", d: "M 196 128 L 188 74 C 184 50 164 34 120 28 L 120 128 Z" },
    { id: "trunk-lid", label: "Tampa do porta-malas", d: "M 72 50 L 120 38 L 168 50 L 152 88 L 88 88 Z" },
    { id: "rear-bumper", label: "Para-choque traseiro", d: "M 44 128 L 88 112 L 152 112 L 196 128 Z" },
    { id: "rear-plate", label: "Placa traseira", d: "M 102 96 L 138 96 L 138 110 L 102 110 Z" },
    { id: "left-taillight", label: "Lanterna esquerda", d: "M 58 84 L 78 84 L 78 106 L 58 106 Z" },
    { id: "right-taillight", label: "Lanterna direita", d: "M 162 84 L 182 84 L 182 106 L 162 106 Z" },
  ],
});
