import { defineIllustration } from "@/lib/photos/illustrations/tokens";

/** Vidros — silhueta para-brisa. */
export const windshieldGlass = defineIllustration({
  id: "windshield-glass",
  viewBox: "0 0 240 160",
  silhouette: "M 44 36 L 196 36 L 184 124 L 56 124 Z",
  fills: [
    { id: "glass-main", d: "M 56 48 L 184 48 L 172 112 L 68 112 Z" },
  ],
  structure: [
    { id: "frame-t", d: "M 44 36 L 196 36", strokeWidth: 0.55 },
    { id: "frame-b", d: "M 56 124 L 184 124", strokeWidth: 0.55 },
    { id: "wiper-l", d: "M 72 48 L 96 112", strokeWidth: 0.45 },
    { id: "wiper-r", d: "M 168 48 L 144 112", strokeWidth: 0.45 },
    { id: "engrave", d: "M 88 96 L 152 96 M 92 102 L 148 102", strokeWidth: 0.35 },
  ],
  parts: [
    { id: "windshield", label: "Para-brisa", d: "M 56 48 L 184 48 L 172 112 L 68 112 Z" },
    { id: "rear-glass", label: "Vidro traseiro", d: "M 56 48 L 184 48 L 172 112 L 68 112 Z" },
    { id: "side-glass", label: "Vidro lateral", d: "M 68 56 L 172 56 L 172 104 L 68 104 Z" },
    { id: "glass-engraving", label: "Gravação do vidro", d: "M 88 88 L 152 88 L 152 108 L 88 108 Z" },
  ],
});
