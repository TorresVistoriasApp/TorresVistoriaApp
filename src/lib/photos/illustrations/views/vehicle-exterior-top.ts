import { defineIllustration } from "@/lib/photos/illustrations/tokens";

/** Sedan — vista superior (teto). */
export const vehicleTop = defineIllustration({
  id: "vehicle-top",
  viewBox: "0 0 240 160",
  structure: [
    { id: "center-line", d: "M 120 24 L 120 136", strokeWidth: 0.4 },
    { id: "windshield-frame", d: "M 72 48 L 88 36 L 152 36 L 168 48", strokeWidth: 0.5 },
    { id: "rear-glass", d: "M 72 112 L 88 124 L 152 124 L 168 112", strokeWidth: 0.5 },
    { id: "door-line-left", d: "M 72 80 L 72 112", strokeWidth: 0.4 },
    { id: "door-line-right", d: "M 168 80 L 168 112", strokeWidth: 0.4 },
    { id: "mirror-left", d: "M 68 72 L 64 68 L 60 72 L 64 76 Z", strokeWidth: 0.45 },
    { id: "mirror-right", d: "M 172 72 L 176 68 L 180 72 L 176 76 Z", strokeWidth: 0.45 },
    { id: "antenna", d: "M 120 24 L 120 32", strokeWidth: 0.5 },
  ],
  parts: [
    {
      id: "full-top",
      label: "Vista superior",
      d: "M 48 80 L 72 48 L 168 48 L 192 80 L 168 112 L 72 112 Z",
    },
    {
      id: "roof",
      label: "Teto",
      d: "M 88 48 L 152 48 L 152 112 L 88 112 Z",
    },
    {
      id: "hood-top",
      label: "Capô",
      d: "M 72 48 L 88 48 L 88 80 L 72 80 Z",
    },
    {
      id: "trunk-top",
      label: "Tampa do porta-malas",
      d: "M 152 48 L 168 48 L 168 80 L 152 80 Z",
    },
    {
      id: "windshield-top",
      label: "Para-brisa",
      d: "M 72 48 L 88 36 L 152 36 L 168 48 L 152 48 L 88 48 Z",
    },
  ],
});
