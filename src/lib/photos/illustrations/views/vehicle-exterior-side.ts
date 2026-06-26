import { defineIllustration } from "@/lib/photos/illustrations/tokens";

/** Sedan — vista lateral esquerda (perspectiva técnica de manual de oficina). */
export const vehicleSideLeft = defineIllustration({
  id: "vehicle-side-left",
  viewBox: "0 0 240 160",
  structure: [
    { id: "ground-line", d: "M 16 134 L 224 134", strokeWidth: 0.5 },
    { id: "shadow", d: "M 36 134 Q 52 130 68 134 Q 120 128 172 134 Q 188 130 204 134", strokeWidth: 0.4, opacity: 0.5 },
    { id: "front-wheel-arch", d: "M 38 108 Q 38 88 52 84 Q 66 80 72 96", strokeWidth: 0.55 },
    { id: "rear-wheel-arch", d: "M 168 96 Q 174 80 188 84 Q 202 88 202 108", strokeWidth: 0.55 },
    { id: "front-rim", d: "M 52 122 m -11 0 a 11 11 0 1 0 22 0 a 11 11 0 1 0 -22 0 M 52 122 m -6 0 a 6 6 0 1 0 12 0 a 6 6 0 1 0 -12 0", strokeWidth: 0.5 },
    { id: "rear-rim", d: "M 188 122 m -11 0 a 11 11 0 1 0 22 0 a 11 11 0 1 0 -22 0 M 188 122 m -6 0 a 6 6 0 1 0 12 0 a 6 6 0 1 0 -12 0", strokeWidth: 0.5 },
    { id: "front-spokes", d: "M 52 111 L 52 133 M 41 122 L 63 122 M 44 115 L 60 129 M 60 115 L 44 129", strokeWidth: 0.35 },
    { id: "rear-spokes", d: "M 188 111 L 188 133 M 177 122 L 199 122 M 180 115 L 196 129 M 196 115 L 180 129", strokeWidth: 0.35 },
    { id: "belt-line", d: "M 74 78 L 198 78", strokeWidth: 0.45 },
    { id: "door-gap-front", d: "M 108 78 L 108 108", strokeWidth: 0.4 },
    { id: "door-gap-rear", d: "M 148 78 L 148 108", strokeWidth: 0.4 },
    { id: "handle-front", d: "M 118 92 L 128 92 Q 130 92 130 94 L 130 96 Q 130 98 128 98 L 118 98 Z", strokeWidth: 0.35 },
    { id: "handle-rear", d: "M 158 92 L 168 92 Q 170 92 170 94 L 170 96 Q 170 98 168 98 L 158 98 Z", strokeWidth: 0.35 },
    { id: "headlight", d: "M 34 88 Q 30 92 34 100 Q 38 96 38 92 Z", strokeWidth: 0.45 },
    { id: "taillight", d: "M 206 88 Q 210 92 206 100 Q 202 96 202 92 Z", strokeWidth: 0.45 },
    { id: "mirror-stem", d: "M 104 68 L 108 62", strokeWidth: 0.5 },
    { id: "roof-rail", d: "M 82 46 L 190 46", strokeWidth: 0.4 },
  ],
  parts: [
    {
      id: "full-side",
      label: "Lateral completa",
      d: "M 28 108 L 34 88 Q 38 72 52 62 L 82 44 L 190 44 L 204 54 Q 212 64 212 78 L 208 108 Q 204 118 198 118 L 42 118 Q 32 118 28 108 Z",
    },
    {
      id: "front-bumper",
      label: "Para-choque dianteiro",
      d: "M 28 108 L 34 100 Q 36 92 38 88 L 42 108 Q 38 112 32 112 Z",
    },
    {
      id: "hood",
      label: "Capô",
      d: "M 38 88 L 52 62 L 82 44 L 82 78 L 74 78 L 74 88 Z",
    },
    {
      id: "front-fender",
      label: "Para-lama dianteiro",
      d: "M 74 78 L 82 78 L 82 88 L 108 88 L 108 108 L 72 108 Q 68 108 66 104 L 66 96 Q 66 84 74 78 Z",
    },
    {
      id: "front-door",
      label: "Porta dianteira",
      d: "M 108 78 L 108 108 L 148 108 L 148 78 Z",
    },
    {
      id: "rear-door",
      label: "Porta traseira",
      d: "M 148 78 L 148 108 L 168 108 L 168 96 Q 168 84 172 78 Z",
    },
    {
      id: "rear-quarter",
      label: "Lateral traseira",
      d: "M 172 78 L 168 96 L 168 108 L 198 118 L 208 108 L 212 78 L 198 78 Z",
    },
    {
      id: "trunk-lid",
      label: "Tampa do porta-malas",
      d: "M 190 44 L 204 54 L 212 64 L 212 78 L 198 78 L 198 58 L 190 46 Z",
    },
    {
      id: "rear-bumper",
      label: "Para-choque traseiro",
      d: "M 198 118 L 212 112 L 214 108 L 208 108 L 204 118 Z",
    },
    {
      id: "roof",
      label: "Teto",
      d: "M 82 44 L 190 44 L 198 58 L 82 58 Z",
    },
    {
      id: "windshield",
      label: "Para-brisa",
      d: "M 82 58 L 82 44 L 72 62 L 74 78 L 82 78 Z",
    },
    {
      id: "front-door-glass",
      label: "Vidro porta dianteira",
      d: "M 112 82 L 112 104 L 144 104 L 144 82 Z",
    },
    {
      id: "rear-door-glass",
      label: "Vidro porta traseira",
      d: "M 152 82 L 152 104 L 164 104 L 164 82 Z",
    },
    {
      id: "rear-quarter-glass",
      label: "Vidro traseiro lateral",
      d: "M 176 82 L 176 96 L 194 88 L 194 72 L 182 72 Z",
    },
    {
      id: "front-wheel",
      label: "Roda dianteira",
      d: "M 52 122 m -20 0 a 20 20 0 1 0 40 0 a 20 20 0 1 0 -40 0",
    },
    {
      id: "rear-wheel",
      label: "Roda traseira",
      d: "M 188 122 m -20 0 a 20 20 0 1 0 40 0 a 20 20 0 1 0 -40 0",
    },
    {
      id: "side-mirror",
      label: "Retrovisor",
      d: "M 104 68 L 108 62 L 118 58 L 122 62 L 118 70 L 108 72 Z",
    },
    {
      id: "rocker-panel",
      label: "Caixa de ar / soleira",
      d: "M 72 108 L 198 118 L 198 124 L 72 114 Z",
    },
    {
      id: "front-plate",
      label: "Placa dianteira",
      d: "M 36 96 L 52 96 L 52 106 L 36 106 Z",
    },
    {
      id: "rear-plate",
      label: "Placa traseira",
      d: "M 200 96 L 214 96 L 214 106 L 200 106 Z",
    },
    {
      id: "plate-seal",
      label: "Lacre da placa",
      d: "M 206 98 L 210 98 L 210 104 L 206 104 Z",
    },
  ],
});
