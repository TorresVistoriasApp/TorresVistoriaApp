import { defineIllustration } from "@/lib/photos/illustrations/tokens";

/** Compartimento do motor — vista técnica superior/frontal. */
export const engineCompartment = defineIllustration({
  id: "engine-compartment",
  viewBox: "0 0 240 160",
  structure: [
    { id: "frame", d: "M 24 28 L 24 132 L 216 132 L 216 28 Z", strokeWidth: 0.55 },
    { id: "hood-open", d: "M 24 28 L 120 12 L 216 28", strokeWidth: 0.5 },
    { id: "cross-member", d: "M 24 68 L 216 68", strokeWidth: 0.45 },
    { id: "engine-block-lines", d: "M 88 76 L 88 120 M 152 76 L 152 120 M 96 84 L 144 84 M 96 96 L 144 96 M 96 108 L 144 108", strokeWidth: 0.35 },
    { id: "battery", d: "M 176 84 L 204 84 L 204 108 L 176 108 Z", strokeWidth: 0.4 },
    { id: "fluid-reservoir", d: "M 36 84 L 56 84 L 56 104 L 36 104 Z", strokeWidth: 0.35 },
    { id: "radiator", d: "M 72 36 L 168 36 L 168 56 L 72 56 Z", strokeWidth: 0.45 },
  ],
  parts: [
    {
      id: "full-compartment",
      label: "Compartimento do motor",
      d: "M 24 28 L 216 28 L 216 132 L 24 132 Z",
    },
    {
      id: "longeron-left",
      label: "Longarina esquerda",
      d: "M 24 68 L 24 132 L 56 132 L 56 68 Z",
    },
    {
      id: "longeron-right",
      label: "Longarina direita",
      d: "M 184 68 L 184 132 L 216 132 L 216 68 Z",
    },
    {
      id: "firewall",
      label: "Painel corta-fogo",
      d: "M 96 68 L 144 68 L 144 132 L 96 132 Z",
    },
    {
      id: "front-panel",
      label: "Painel frontal",
      d: "M 72 36 L 168 36 L 168 68 L 72 68 Z",
    },
    {
      id: "strut-tower-left",
      label: "Torre amortecedor esquerda",
      d: "M 56 68 L 56 96 L 80 96 L 80 68 Z",
    },
    {
      id: "strut-tower-right",
      label: "Torre amortecedor direita",
      d: "M 160 68 L 160 96 L 184 96 L 184 68 Z",
    },
    {
      id: "engine-block",
      label: "Motor",
      d: "M 80 76 L 160 76 L 160 120 L 80 120 Z",
    },
    {
      id: "engine-number",
      label: "Número do motor",
      d: "M 96 96 L 144 96 L 144 112 L 96 112 Z",
    },
    {
      id: "compartment-label",
      label: "Etiqueta do compartimento",
      d: "M 168 72 L 204 72 L 204 88 L 168 88 Z",
    },
  ],
});
