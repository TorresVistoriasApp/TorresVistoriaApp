import { defineIllustration } from "@/lib/photos/illustrations/tokens";
import { SEDAN_TOP_BODY } from "@/lib/photos/illustrations/silhouette-paths";

/** Sedan — vista superior (teto) em silhueta. */
export const vehicleTop = defineIllustration({
  id: "vehicle-top",
  viewBox: "0 0 240 160",
  silhouette: SEDAN_TOP_BODY,
  fills: [
    { id: "windshield-t", d: "M 72 48 L 88 56 L 152 56 L 168 48 L 148 68 L 92 68 Z" },
    { id: "rear-glass-t", d: "M 92 68 L 148 68 L 168 88 L 72 88 Z" },
  ],
  structure: [
    { id: "center", d: "M 120 48 L 120 128", strokeWidth: 0.45 },
    { id: "door-l", d: "M 72 88 L 72 128", strokeWidth: 0.4 },
    { id: "door-r", d: "M 168 88 L 168 128", strokeWidth: 0.4 },
    { id: "mirror-l", d: "M 68 72 L 60 68 L 64 76 Z", strokeWidth: 0.45 },
    { id: "mirror-r", d: "M 172 72 L 180 68 L 176 76 Z", strokeWidth: 0.45 },
  ],
  parts: [
    { id: "full-top", label: "Vista superior", d: SEDAN_TOP_BODY },
    { id: "roof", label: "Teto", d: "M 88 56 L 152 56 L 152 88 L 88 88 Z" },
    { id: "hood-top", label: "Capô", d: "M 72 48 L 88 56 L 88 88 L 72 88 Z" },
    { id: "trunk-top", label: "Tampa do porta-malas", d: "M 152 56 L 168 48 L 168 88 L 152 88 Z" },
    { id: "windshield-top", label: "Para-brisa", d: "M 72 48 L 88 56 L 152 56 L 168 48 L 148 68 L 92 68 Z" },
  ],
});
