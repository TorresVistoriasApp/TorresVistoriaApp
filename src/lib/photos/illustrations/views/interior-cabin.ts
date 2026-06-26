import { defineIllustration } from "@/lib/photos/illustrations/tokens";

/** Interior — silhueta do painel e cabine. */
export const interiorCabin = defineIllustration({
  id: "interior-cabin",
  viewBox: "0 0 240 160",
  silhouette: "M 36 128 L 48 40 L 192 40 L 204 128 Z",
  fills: [
    { id: "windshield", d: "M 48 40 L 72 52 L 168 52 L 192 40 L 168 72 L 72 72 Z" },
    { id: "steering", d: "M 88 88 m -14 0 a 14 14 0 1 0 28 0 a 14 14 0 1 0 -28 0" },
    { id: "seat-l", d: "M 52 96 L 88 96 L 88 128 L 52 128 Z" },
    { id: "seat-r", d: "M 152 96 L 188 96 L 188 128 L 152 128 Z" },
  ],
  structure: [
    { id: "dash", d: "M 72 72 L 168 72", strokeWidth: 0.55 },
    { id: "console", d: "M 112 72 L 128 72 L 128 128 L 112 128 Z", strokeWidth: 0.45 },
    { id: "wheel-spoke", d: "M 88 74 L 88 102 M 74 88 L 102 88", strokeWidth: 0.4 },
  ],
  parts: [
    { id: "instrument-panel", label: "Painel de instrumentos", d: "M 72 52 L 168 52 L 168 72 L 72 72 Z" },
    { id: "odometer", label: "Hodômetro", d: "M 104 56 L 136 56 L 136 68 L 104 68 Z" },
    {
      id: "steering-wheel",
      label: "Volante",
      d: "M 88 88 m -14 0 a 14 14 0 1 0 28 0 a 14 14 0 1 0 -28 0",
    },
    { id: "center-console", label: "Console central", d: "M 112 72 L 128 72 L 128 128 L 112 128 Z" },
    { id: "front-seats", label: "Bancos dianteiros", d: "M 52 96 L 188 96 L 188 128 L 52 128 Z" },
    { id: "rear-seats", label: "Bancos traseiros", d: "M 72 88 L 168 88 L 168 128 L 72 128 Z" },
    { id: "rear-panel-view", label: "Painel do banco traseiro", d: "M 72 52 L 168 52 L 168 96 L 72 96 Z" },
    { id: "door-trim", label: "Portas internas", d: "M 48 52 L 72 52 L 72 128 L 48 128 Z" },
    { id: "trim-carpet", label: "Revestimentos", d: "M 52 128 L 188 128 L 188 134 L 52 134 Z" },
  ],
});
