import { defineIllustration } from "@/lib/photos/illustrations/tokens";

/** Compartimento do motor — silhueta com capô aberto. */
export const engineCompartment = defineIllustration({
  id: "engine-compartment",
  viewBox: "0 0 240 160",
  silhouette: "M 20 36 L 20 132 L 220 132 L 220 36 L 120 18 Z",
  fills: [
    { id: "engine-block", d: "M 78 72 L 162 72 L 162 118 L 78 118 Z" },
    { id: "radiator", d: "M 68 36 L 172 36 L 172 56 L 68 56 Z" },
  ],
  structure: [
    { id: "hood-edge", d: "M 20 36 L 120 18 L 220 36", strokeWidth: 0.55 },
    { id: "cross", d: "M 20 68 L 220 68", strokeWidth: 0.45 },
    { id: "engine-lines", d: "M 88 80 L 88 110 M 152 80 L 152 110 M 96 88 L 144 88 M 96 100 L 144 100", strokeWidth: 0.35 },
  ],
  parts: [
    { id: "full-compartment", label: "Compartimento do motor", d: "M 20 36 L 220 36 L 220 132 L 20 132 Z" },
    { id: "longeron-left", label: "Longarina esquerda", d: "M 20 68 L 20 132 L 58 132 L 58 68 Z" },
    { id: "longeron-right", label: "Longarina direita", d: "M 182 68 L 182 132 L 220 132 L 220 68 Z" },
    { id: "firewall", label: "Painel corta-fogo", d: "M 96 68 L 144 68 L 144 132 L 96 132 Z" },
    { id: "front-panel", label: "Painel frontal", d: "M 68 36 L 172 36 L 172 68 L 68 68 Z" },
    { id: "strut-tower-left", label: "Torre amortecedor esquerda", d: "M 58 68 L 58 96 L 82 96 L 82 68 Z" },
    { id: "strut-tower-right", label: "Torre amortecedor direita", d: "M 158 68 L 158 96 L 182 96 L 182 68 Z" },
    { id: "engine-block", label: "Motor", d: "M 78 72 L 162 72 L 162 118 L 78 118 Z" },
    { id: "engine-number", label: "Número do motor", d: "M 96 96 L 144 96 L 144 112 L 96 112 Z" },
    { id: "compartment-label", label: "Etiqueta do compartimento", d: "M 168 72 L 204 72 L 204 88 L 168 88 Z" },
  ],
});
