import { defineIllustration } from "@/lib/photos/illustrations/tokens";

/** Documento — CRLV, CRV, ATPV-e. */
export const documentSheet = defineIllustration({
  id: "document-sheet",
  viewBox: "0 0 240 160",
  structure: [
    { id: "page-shadow", d: "M 44 28 L 44 136 L 196 136 L 196 28 Z", strokeWidth: 0.35, opacity: 0.4 },
    { id: "header-band", d: "M 36 36 L 188 36 L 188 52 L 36 52 Z", strokeWidth: 0.45 },
    { id: "text-line-1", d: "M 44 64 L 180 64", strokeWidth: 0.35 },
    { id: "text-line-2", d: "M 44 76 L 180 76", strokeWidth: 0.35 },
    { id: "text-line-3", d: "M 44 88 L 160 88", strokeWidth: 0.35 },
    { id: "text-line-4", d: "M 44 100 L 140 100", strokeWidth: 0.35 },
    { id: "text-line-5", d: "M 44 112 L 120 112", strokeWidth: 0.35 },
    { id: "stamp", d: "M 148 96 L 176 96 L 176 120 L 148 120 Z", strokeWidth: 0.4 },
    { id: "fold-corner", d: "M 176 28 L 188 28 L 188 40 L 176 40 Z", strokeWidth: 0.35 },
  ],
  parts: [
    {
      id: "full-document",
      label: "Documento",
      d: "M 36 24 L 188 24 L 188 132 L 36 132 Z",
    },
    {
      id: "crlv",
      label: "CRLV",
      d: "M 36 24 L 188 24 L 188 132 L 36 132 Z",
    },
    {
      id: "crv",
      label: "CRV",
      d: "M 36 24 L 188 24 L 188 132 L 36 132 Z",
    },
    {
      id: "atpv",
      label: "ATPV-e",
      d: "M 36 24 L 188 24 L 188 132 L 36 132 Z",
    },
  ],
});
