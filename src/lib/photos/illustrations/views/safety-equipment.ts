import { defineIllustration } from "@/lib/photos/illustrations/tokens";

/** Equipamentos de segurançade — cinto, airbag, extintor, etc. */
export const safetyEquipment = defineIllustration({
  id: "safety-equipment",
  viewBox: "0 0 240 160",
  structure: [
    { id: "seat-outline", d: "M 56 48 L 184 48 L 184 128 L 56 128 Z", strokeWidth: 0.45 },
    { id: "belt-path", d: "M 72 48 L 72 88 L 120 104 L 168 88 L 168 48", strokeWidth: 0.5 },
    { id: "extinguisher-body", d: "M 96 72 L 96 112 L 144 112 L 144 72 Q 120 64 96 72 Z", strokeWidth: 0.45 },
    { id: "triangle", d: "M 120 72 L 104 104 L 136 104 Z", strokeWidth: 0.45 },
    { id: "jack", d: "M 168 88 L 192 88 L 192 112 L 168 112 Z", strokeWidth: 0.4 },
    { id: "wheel-wrench", d: "M 48 88 L 72 88 L 72 96 L 56 96 L 56 112 L 48 112 Z", strokeWidth: 0.4 },
  ],
  parts: [
    {
      id: "seatbelt-label",
      label: "Data do cinto",
      d: "M 104 72 L 136 72 L 136 88 L 104 88 Z",
    },
    {
      id: "airbag",
      label: "Airbag",
      d: "M 96 48 L 144 48 L 144 72 L 96 72 Z",
    },
    {
      id: "extinguisher",
      label: "Extintor",
      d: "M 96 72 L 96 112 L 144 112 L 144 72 Q 120 64 96 72 Z",
    },
    {
      id: "jack",
      label: "Macaco",
      d: "M 168 88 L 192 88 L 192 112 L 168 112 Z",
    },
    {
      id: "triangle",
      label: "Triângulo",
      d: "M 120 72 L 104 104 L 136 104 Z",
    },
    {
      id: "wheel-wrench",
      label: "Chave de roda",
      d: "M 48 88 L 72 88 L 72 96 L 56 96 L 56 112 L 48 112 Z",
    },
    {
      id: "spare-tire",
      label: "Estepe",
      d: "M 96 88 m -20 0 a 20 20 0 1 0 40 0 a 20 20 0 1 0 -40 0",
    },
  ],
});
