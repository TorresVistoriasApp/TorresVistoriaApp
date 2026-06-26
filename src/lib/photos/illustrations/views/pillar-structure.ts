import { defineIllustration } from "@/lib/photos/illustrations/tokens";

/** Colunas estruturais — A, B, C. */
export const pillarStructure = defineIllustration({
  id: "pillar-structure",
  viewBox: "0 0 240 160",
  structure: [
    { id: "roof-rail", d: "M 40 32 L 200 32", strokeWidth: 0.5 },
    { id: "rocker", d: "M 40 128 L 200 128", strokeWidth: 0.5 },
    { id: "pillar-a", d: "M 56 32 L 56 128", strokeWidth: 0.55 },
    { id: "pillar-b", d: "M 120 32 L 120 128", strokeWidth: 0.55 },
    { id: "pillar-c", d: "M 184 32 L 184 128", strokeWidth: 0.55 },
    { id: "glass-front", d: "M 56 48 L 120 40 L 120 96 L 56 104 Z", strokeWidth: 0.4 },
    { id: "glass-rear", d: "M 120 40 L 184 48 L 184 104 L 120 96 Z", strokeWidth: 0.4 },
  ],
  parts: [
    {
      id: "pillar-a-left",
      label: "Coluna dianteira esquerda",
      d: "M 48 32 L 64 32 L 64 128 L 48 128 Z",
    },
    {
      id: "pillar-b-left",
      label: "Coluna central esquerda",
      d: "M 112 32 L 128 32 L 128 128 L 112 128 Z",
    },
    {
      id: "pillar-c-left",
      label: "Coluna traseira esquerda",
      d: "M 176 32 L 192 32 L 192 128 L 176 128 Z",
    },
    {
      id: "pillar-a-right",
      label: "Coluna dianteira direita",
      d: "M 48 32 L 64 32 L 64 128 L 48 128 Z",
    },
    {
      id: "pillar-b-right",
      label: "Coluna central direita",
      d: "M 112 32 L 128 32 L 128 128 L 112 128 Z",
    },
    {
      id: "pillar-c-right",
      label: "Coluna traseira direita",
      d: "M 176 32 L 192 32 L 192 128 L 176 128 Z",
    },
  ],
});
