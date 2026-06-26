import { defineIllustration } from "@/lib/photos/illustrations/tokens";

/** Roda e pneu — silhueta reconhecível. */
export const wheelAssembly = defineIllustration({
  id: "wheel-assembly",
  viewBox: "0 0 240 160",
  silhouette: "M 120 80 m -52 0 a 52 52 0 1 0 104 0 a 52 52 0 1 0 -104 0",
  fills: [
    { id: "rim", d: "M 120 80 m -34 0 a 34 34 0 1 0 68 0 a 34 34 0 1 0 -68 0" },
    { id: "hub", d: "M 120 80 m -12 0 a 12 12 0 1 0 24 0 a 12 12 0 1 0 -24 0" },
  ],
  structure: [
    { id: "spoke-a", d: "M 120 28 L 120 132", strokeWidth: 0.55 },
    { id: "spoke-b", d: "M 68 80 L 172 80", strokeWidth: 0.55 },
    { id: "spoke-c", d: "M 83 43 L 157 117", strokeWidth: 0.45 },
    { id: "spoke-d", d: "M 157 43 L 83 117", strokeWidth: 0.45 },
    { id: "tread-top", d: "M 72 48 Q 120 28 168 48", strokeWidth: 0.5 },
    { id: "tread-bot", d: "M 72 112 Q 120 132 168 112", strokeWidth: 0.5 },
  ],
  parts: [
    {
      id: "full-wheel",
      label: "Roda completa",
      d: "M 120 80 m -52 0 a 52 52 0 1 0 104 0 a 52 52 0 1 0 -104 0",
    },
    {
      id: "tire",
      label: "Pneu",
      d: "M 120 80 m -52 0 a 52 52 0 1 0 104 0 a 52 52 0 1 0 -104 0 M 120 80 m -34 0 a 34 34 0 1 1 68 0 a 34 34 0 1 1 -68 0",
    },
    { id: "rim", label: "Aro", d: "M 120 80 m -34 0 a 34 34 0 1 0 68 0 a 34 34 0 1 0 -68 0" },
    { id: "tread", label: "Sulco do pneu", d: "M 72 68 L 168 68 L 168 92 L 72 92 Z" },
    { id: "tire-condition", label: "Estado do pneu", d: "M 76 56 L 164 56 L 164 104 L 76 104 Z" },
  ],
});
