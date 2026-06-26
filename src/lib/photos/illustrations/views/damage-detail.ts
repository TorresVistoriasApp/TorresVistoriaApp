import { defineIllustration } from "@/lib/photos/illustrations/tokens";

/** Detalhe de avaria / componente genérico. */
export const damageDetail = defineIllustration({
  id: "damage-detail",
  viewBox: "0 0 240 160",
  structure: [
    { id: "panel-outline", d: "M 40 36 L 200 36 L 200 124 L 40 124 Z", strokeWidth: 0.5 },
    { id: "panel-seam-h", d: "M 40 72 L 200 72", strokeWidth: 0.35 },
    { id: "panel-seam-v", d: "M 120 36 L 120 124", strokeWidth: 0.35 },
    { id: "surface-texture", d: "M 56 48 L 72 48 M 168 48 L 184 48 M 56 108 L 72 108 M 168 108 L 184 108", strokeWidth: 0.3 },
  ],
  parts: [
    {
      id: "damage-area",
      label: "Área da avaria",
      d: "M 72 56 L 168 56 L 168 104 L 72 104 Z",
    },
    {
      id: "component-area",
      label: "Componente",
      d: "M 56 48 L 184 48 L 184 112 L 56 112 Z",
    },
    {
      id: "paint-test",
      label: "Teste de pintura",
      d: "M 88 64 L 152 64 L 152 96 L 88 96 Z",
    },
  ],
});
