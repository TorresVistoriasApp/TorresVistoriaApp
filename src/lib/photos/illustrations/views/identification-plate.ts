import { defineIllustration } from "@/lib/photos/illustrations/tokens";

/** Placas de identificação — chassi, motor, etiquetas. */
export const identificationPlate = defineIllustration({
  id: "identification-plate",
  viewBox: "0 0 240 160",
  structure: [
    { id: "mounting-bracket", d: "M 72 48 L 72 112 M 168 48 L 168 112", strokeWidth: 0.4 },
    { id: "rivet-1", d: "M 76 52 m -2 0 a 2 2 0 1 0 4 0 a 2 2 0 1 0 -4 0", strokeWidth: 0.35 },
    { id: "rivet-2", d: "M 164 52 m -2 0 a 2 2 0 1 0 4 0 a 2 2 0 1 0 -4 0", strokeWidth: 0.35 },
    { id: "rivet-3", d: "M 76 108 m -2 0 a 2 2 0 1 0 4 0 a 2 2 0 1 0 -4 0", strokeWidth: 0.35 },
    { id: "rivet-4", d: "M 164 108 m -2 0 a 2 2 0 1 0 4 0 a 2 2 0 1 0 -4 0", strokeWidth: 0.35 },
    { id: "char-lines", d: "M 88 72 L 152 72 M 88 80 L 152 80 M 88 88 L 152 88 M 88 96 L 152 96", strokeWidth: 0.35 },
  ],
  parts: [
    {
      id: "chassis-vin",
      label: "Número do chassi",
      d: "M 80 56 L 160 56 L 160 104 L 80 104 Z",
    },
    {
      id: "engine-vin",
      label: "Número do motor",
      d: "M 80 56 L 160 56 L 160 104 L 80 104 Z",
    },
    {
      id: "pillar-label",
      label: "Etiqueta da coluna",
      d: "M 96 64 L 144 64 L 144 96 L 96 96 Z",
    },
    {
      id: "compartment-label",
      label: "Etiqueta do compartimento",
      d: "M 88 60 L 152 60 L 152 100 L 88 100 Z",
    },
  ],
});
