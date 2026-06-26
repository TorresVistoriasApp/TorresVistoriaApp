import { defineIllustration } from "@/lib/photos/illustrations/tokens";

/** Vidros — gravações e para-brisa. */
export const windshieldGlass = defineIllustration({
  id: "windshield-glass",
  viewBox: "0 0 240 160",
  structure: [
    { id: "frame-top", d: "M 48 40 L 192 40", strokeWidth: 0.5 },
    { id: "frame-bottom", d: "M 56 120 L 184 120", strokeWidth: 0.5 },
    { id: "frame-left", d: "M 48 40 L 56 120", strokeWidth: 0.45 },
    { id: "frame-right", d: "M 192 40 L 184 120", strokeWidth: 0.45 },
    { id: "wiper-left", d: "M 72 48 L 96 112", strokeWidth: 0.4 },
    { id: "wiper-right", d: "M 168 48 L 144 112", strokeWidth: 0.4 },
    { id: "dot-matrix", d: "M 108 88 m -4 0 a 4 4 0 1 0 8 0 a 4 4 0 1 0 -8 0", strokeWidth: 0.35 },
    { id: "engraving-line-1", d: "M 88 96 L 152 96", strokeWidth: 0.35 },
    { id: "engraving-line-2", d: "M 92 102 L 148 102", strokeWidth: 0.35 },
  ],
  parts: [
    {
      id: "windshield",
      label: "Para-brisa",
      d: "M 48 40 L 192 40 L 184 120 L 56 120 Z",
    },
    {
      id: "rear-glass",
      label: "Vidro traseiro",
      d: "M 48 40 L 192 40 L 184 120 L 56 120 Z",
    },
    {
      id: "side-glass",
      label: "Vidro lateral",
      d: "M 64 48 L 176 48 L 176 112 L 64 112 Z",
    },
    {
      id: "glass-engraving",
      label: "Gravação do vidro",
      d: "M 88 88 L 152 88 L 152 108 L 88 108 Z",
    },
  ],
});
