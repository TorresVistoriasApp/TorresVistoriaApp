import { defineIllustration } from "@/lib/photos/illustrations/tokens";

/** Interior — painel, volante, bancos. */
export const interiorCabin = defineIllustration({
  id: "interior-cabin",
  viewBox: "0 0 240 160",
  structure: [
    { id: "windshield-frame", d: "M 48 36 L 72 28 L 168 28 L 192 36 L 168 56 L 72 56 Z", strokeWidth: 0.5 },
    { id: "steering-spokes", d: "M 88 88 L 88 104 M 80 96 L 96 96 M 82 90 L 94 102 M 94 90 L 82 102", strokeWidth: 0.35 },
    { id: "dash-line", d: "M 56 72 L 184 72", strokeWidth: 0.45 },
    { id: "center-console", d: "M 112 72 L 128 72 L 128 128 L 112 128 Z", strokeWidth: 0.4 },
    { id: "seat-left", d: "M 56 88 L 88 88 L 88 128 L 56 128 Z", strokeWidth: 0.4 },
    { id: "seat-right", d: "M 152 88 L 184 88 L 184 128 L 152 128 Z", strokeWidth: 0.4 },
    { id: "rear-seat", d: "M 72 96 L 168 96 L 168 128 L 72 128 Z", strokeWidth: 0.35 },
  ],
  parts: [
    {
      id: "instrument-panel",
      label: "Painel de instrumentos",
      d: "M 72 56 L 168 56 L 168 72 L 72 72 Z",
    },
    {
      id: "odometer",
      label: "Hodômetro",
      d: "M 104 58 L 136 58 L 136 70 L 104 70 Z",
    },
    {
      id: "steering-wheel",
      label: "Volante",
      d: "M 88 88 m -12 0 a 12 12 0 1 0 24 0 a 12 12 0 1 0 -24 0",
    },
    {
      id: "center-console",
      label: "Console central",
      d: "M 112 72 L 128 72 L 128 128 L 112 128 Z",
    },
    {
      id: "front-seats",
      label: "Bancos dianteiros",
      d: "M 56 88 L 184 88 L 184 128 L 56 128 Z",
    },
    {
      id: "rear-seats",
      label: "Bancos traseiros",
      d: "M 72 96 L 168 96 L 168 128 L 72 128 Z",
    },
    {
      id: "rear-panel-view",
      label: "Painel do banco traseiro",
      d: "M 72 56 L 168 56 L 168 96 L 72 96 Z",
    },
    {
      id: "door-trim",
      label: "Portas internas",
      d: "M 48 56 L 72 56 L 72 128 L 48 128 Z",
    },
    {
      id: "trim-carpet",
      label: "Revestimentos",
      d: "M 56 128 L 184 128 L 184 136 L 56 136 Z",
    },
  ],
});
