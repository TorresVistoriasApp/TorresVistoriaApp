import { defineIllustration } from "@/lib/photos/illustrations/tokens";
import { SEDAN_FRONT_BODY } from "@/lib/photos/illustrations/silhouette-paths";

/** Sedan — vista frontal em silhueta. */
export const vehicleFront = defineIllustration({
  id: "vehicle-front",
  viewBox: "0 0 240 160",
  silhouette: SEDAN_FRONT_BODY,
  fills: [
    { id: "windshield", d: "M 72 48 L 120 36 L 168 48 L 148 68 L 92 68 Z" },
    { id: "wheel-l", d: "M 52 128 m -14 0 a 14 14 0 1 0 28 0 a 14 14 0 1 0 -28 0" },
    { id: "wheel-r", d: "M 188 128 m -14 0 a 14 14 0 1 0 28 0 a 14 14 0 1 0 -28 0" },
  ],
  structure: [
    { id: "ground", d: "M 20 136 L 220 136", strokeWidth: 0.55, opacity: 0.45 },
    { id: "grille", d: "M 88 88 L 152 88 L 152 112 L 88 112 Z", strokeWidth: 0.5 },
    { id: "grille-v", d: "M 96 88 L 96 112 M 108 88 L 108 112 M 120 88 L 120 112 M 132 88 L 132 112 M 144 88 L 144 112", strokeWidth: 0.35 },
    { id: "hl-l", d: "M 56 82 L 76 82 L 76 104 L 56 104 Z", strokeWidth: 0.5 },
    { id: "hl-r", d: "M 164 82 L 184 82 L 184 104 L 164 104 Z", strokeWidth: 0.5 },
    { id: "hood-line", d: "M 120 48 L 120 88", strokeWidth: 0.45 },
  ],
  parts: [
    { id: "full-front", label: "Frente completa", d: SEDAN_FRONT_BODY },
    { id: "front-left-45", label: "Frente 45° esquerda", d: "M 44 128 L 52 72 C 56 48 76 32 120 26 L 120 128 Z" },
    { id: "front-right-45", label: "Frente 45° direita", d: "M 196 128 L 188 72 C 184 48 164 32 120 26 L 120 128 Z" },
    { id: "hood", label: "Capô", d: "M 72 48 L 120 36 L 168 48 L 152 88 L 88 88 Z" },
    { id: "front-bumper", label: "Para-choque dianteiro", d: "M 44 128 L 88 112 L 152 112 L 196 128 Z" },
    { id: "grille", label: "Grade", d: "M 88 88 L 152 88 L 152 112 L 88 112 Z" },
    { id: "front-plate", label: "Placa dianteira", d: "M 102 114 L 138 114 L 138 126 L 102 126 Z" },
    { id: "left-headlight", label: "Farol esquerdo", d: "M 56 82 L 76 82 L 76 104 L 56 104 Z" },
    { id: "right-headlight", label: "Farol direito", d: "M 164 82 L 184 82 L 184 104 L 164 104 Z" },
    { id: "left-fender", label: "Para-lama esquerdo", d: "M 44 128 L 56 104 L 56 82 L 72 88 L 72 128 Z" },
    { id: "right-fender", label: "Para-lama direito", d: "M 196 128 L 184 104 L 184 82 L 168 88 L 168 128 Z" },
  ],
});
