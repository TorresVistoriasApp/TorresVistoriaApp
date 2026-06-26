import { defineIllustration } from "@/lib/photos/illustrations/tokens";

/** Roda e pneu — vista técnica detalhada. */
export const wheelAssembly = defineIllustration({
  id: "wheel-assembly",
  viewBox: "0 0 240 160",
  structure: [
    { id: "ground", d: "M 32 138 L 208 138", strokeWidth: 0.5 },
    { id: "tire-sidewall-top", d: "M 60 80 Q 120 52 180 80", strokeWidth: 0.45 },
    { id: "tire-sidewall-bottom", d: "M 60 120 Q 120 148 180 120", strokeWidth: 0.45 },
    { id: "rim-outer", d: "M 120 100 m -36 0 a 36 36 0 1 0 72 0 a 36 36 0 1 0 -72 0", strokeWidth: 0.55 },
    { id: "rim-inner", d: "M 120 100 m -22 0 a 22 22 0 1 0 44 0 a 22 22 0 1 0 -44 0", strokeWidth: 0.5 },
    { id: "spokes", d: "M 120 64 L 120 136 M 84 100 L 156 100 M 95 75 L 145 125 M 145 75 L 95 125", strokeWidth: 0.4 },
    { id: "valve", d: "M 152 88 L 156 84 L 160 88", strokeWidth: 0.45 },
    { id: "tread-blocks", d: "M 68 108 L 76 108 M 164 108 L 172 108 M 72 116 L 80 116 M 160 116 L 168 116", strokeWidth: 0.35 },
  ],
  parts: [
    {
      id: "full-wheel",
      label: "Roda completa",
      d: "M 120 100 m -48 0 a 48 48 0 1 0 96 0 a 48 48 0 1 0 -96 0",
    },
    {
      id: "tire",
      label: "Pneu",
      d: "M 120 100 m -48 0 a 48 48 0 1 0 96 0 a 48 48 0 1 0 -96 0 M 120 100 m -36 0 a 36 36 0 1 1 72 0 a 36 36 0 1 1 -72 0",
    },
    {
      id: "rim",
      label: "Aro",
      d: "M 120 100 m -36 0 a 36 36 0 1 0 72 0 a 36 36 0 1 0 -72 0 M 120 100 m -22 0 a 22 22 0 1 1 44 0 a 22 22 0 1 1 -44 0",
    },
    {
      id: "tread",
      label: "Sulco do pneu",
      d: "M 68 96 L 172 96 L 172 112 L 68 112 Z",
    },
    {
      id: "tire-condition",
      label: "Estado do pneu",
      d: "M 72 88 L 168 88 L 168 120 L 72 120 Z",
    },
  ],
});
