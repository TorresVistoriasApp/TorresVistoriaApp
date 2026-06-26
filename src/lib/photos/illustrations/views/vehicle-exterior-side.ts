import { defineIllustration } from "@/lib/photos/illustrations/tokens";
import {
  SEDAN_SIDE_BODY,
  SEDAN_SIDE_WHEELS,
  SEDAN_SIDE_WINDOWS,
} from "@/lib/photos/illustrations/silhouette-paths";

/** Sedan — vista lateral com silhueta reconhecível e zonas de destaque por peça. */
export const vehicleSideLeft = defineIllustration({
  id: "vehicle-side-left",
  viewBox: "0 0 240 160",
  silhouette: SEDAN_SIDE_BODY,
  fills: [
    { id: "windows", d: SEDAN_SIDE_WINDOWS },
    {
      id: "wheel-front",
      d: `M ${SEDAN_SIDE_WHEELS.front.cx} ${SEDAN_SIDE_WHEELS.front.cy} m -${SEDAN_SIDE_WHEELS.front.r} 0 a ${SEDAN_SIDE_WHEELS.front.r} ${SEDAN_SIDE_WHEELS.front.r} 0 1 0 ${SEDAN_SIDE_WHEELS.front.r * 2} 0 a ${SEDAN_SIDE_WHEELS.front.r} ${SEDAN_SIDE_WHEELS.front.r} 0 1 0 -${SEDAN_SIDE_WHEELS.front.r * 2} 0`,
    },
    {
      id: "wheel-rear",
      d: `M ${SEDAN_SIDE_WHEELS.rear.cx} ${SEDAN_SIDE_WHEELS.rear.cy} m -${SEDAN_SIDE_WHEELS.rear.r} 0 a ${SEDAN_SIDE_WHEELS.rear.r} ${SEDAN_SIDE_WHEELS.rear.r} 0 1 0 ${SEDAN_SIDE_WHEELS.rear.r * 2} 0 a ${SEDAN_SIDE_WHEELS.rear.r} ${SEDAN_SIDE_WHEELS.rear.r} 0 1 0 -${SEDAN_SIDE_WHEELS.rear.r * 2} 0`,
    },
  ],
  structure: [
    { id: "ground", d: "M 16 132 L 224 132", strokeWidth: 0.55, opacity: 0.45 },
    { id: "belt", d: "M 78 76 L 168 76", strokeWidth: 0.5 },
    { id: "door-front", d: "M 100 76 L 100 112", strokeWidth: 0.45 },
    { id: "door-rear", d: "M 142 76 L 142 112", strokeWidth: 0.45 },
    { id: "handle-f", d: "M 108 86 L 122 86", strokeWidth: 0.55 },
    { id: "handle-r", d: "M 150 86 L 164 86", strokeWidth: 0.55 },
    { id: "mirror", d: "M 96 58 L 104 50 L 112 54 L 108 62 Z", strokeWidth: 0.5 },
    { id: "headlamp", d: "M 28 86 Q 24 92 28 98", strokeWidth: 0.55 },
    { id: "taillamp", d: "M 212 86 Q 216 92 212 98", strokeWidth: 0.55 },
    {
      id: "rim-f",
      d: `M ${SEDAN_SIDE_WHEELS.front.cx} ${SEDAN_SIDE_WHEELS.front.cy} m -7 0 a 7 7 0 1 0 14 0 a 7 7 0 1 0 -14 0`,
      strokeWidth: 0.45,
    },
    {
      id: "rim-r",
      d: `M ${SEDAN_SIDE_WHEELS.rear.cx} ${SEDAN_SIDE_WHEELS.rear.cy} m -7 0 a 7 7 0 1 0 14 0 a 7 7 0 1 0 -14 0`,
      strokeWidth: 0.45,
    },
  ],
  parts: [
    { id: "full-side", label: "Lateral completa", d: SEDAN_SIDE_BODY },
    {
      id: "front-bumper",
      label: "Para-choque dianteiro",
      d: "M 22 118 L 40 118 L 42 104 L 38 92 L 28 96 Z",
    },
    {
      id: "hood",
      label: "Capô",
      d: "M 26 96 C 28 80 36 66 50 54 C 62 44 78 36 92 38 L 92 76 L 78 76 L 40 104 Z",
    },
    {
      id: "front-fender",
      label: "Para-lama dianteiro",
      d: "M 78 76 L 100 76 L 100 118 L 40 118 L 42 104 L 78 88 Z",
    },
    {
      id: "front-door",
      label: "Porta dianteira",
      d: "M 100 76 L 142 76 L 142 118 L 100 118 Z",
    },
    {
      id: "rear-door",
      label: "Porta traseira",
      d: "M 142 76 L 168 76 L 168 118 L 142 118 Z",
    },
    {
      id: "rear-quarter",
      label: "Lateral traseira",
      d: "M 168 76 L 218 100 L 220 118 L 162 118 L 168 104 Z",
    },
    {
      id: "trunk-lid",
      label: "Tampa do porta-malas",
      d: "M 160 32 C 180 36 196 46 206 60 L 206 76 L 168 76 L 162 52 Z",
    },
    {
      id: "rear-bumper",
      label: "Para-choque traseiro",
      d: "M 162 118 L 220 118 L 218 104 L 206 98 L 190 104 Z",
    },
    {
      id: "roof",
      label: "Teto",
      d: "M 92 38 L 162 52 L 148 68 L 92 68 Z",
    },
    {
      id: "windshield",
      label: "Para-brisa",
      d: "M 78 52 L 92 38 L 92 68 L 78 76 Z",
    },
    {
      id: "front-door-glass",
      label: "Vidro porta dianteira",
      d: "M 100 68 L 100 88 L 118 88 L 118 68 Z",
    },
    {
      id: "rear-door-glass",
      label: "Vidro porta traseira",
      d: "M 138 68 L 138 88 L 148 68 Z",
    },
    {
      id: "rear-quarter-glass",
      label: "Vidro traseiro lateral",
      d: "M 148 68 L 162 52 L 162 68 Z",
    },
    {
      id: "front-wheel",
      label: "Roda dianteira",
      d: `M ${SEDAN_SIDE_WHEELS.front.cx} ${SEDAN_SIDE_WHEELS.front.cy} m -18 0 a 18 18 0 1 0 36 0 a 18 18 0 1 0 -36 0`,
    },
    {
      id: "rear-wheel",
      label: "Roda traseira",
      d: `M ${SEDAN_SIDE_WHEELS.rear.cx} ${SEDAN_SIDE_WHEELS.rear.cy} m -18 0 a 18 18 0 1 0 36 0 a 18 18 0 1 0 -36 0`,
    },
    {
      id: "side-mirror",
      label: "Retrovisor",
      d: "M 96 58 L 104 50 L 112 54 L 108 62 Z",
    },
    {
      id: "rocker-panel",
      label: "Caixa de ar / soleira",
      d: "M 78 112 L 200 112 L 200 118 L 78 118 Z",
    },
    {
      id: "front-plate",
      label: "Placa dianteira",
      d: "M 32 100 L 48 100 L 48 112 L 32 112 Z",
    },
    {
      id: "rear-plate",
      label: "Placa traseira",
      d: "M 198 100 L 214 100 L 214 112 L 198 112 Z",
    },
    { id: "plate-seal", label: "Lacre da placa", d: "M 204 102 L 210 102 L 210 110 L 204 110 Z" },
  ],
});
