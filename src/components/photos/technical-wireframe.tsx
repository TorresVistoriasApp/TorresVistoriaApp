import { GUIDE_COLORS } from "@/lib/photos/guide-tokens";
import { WIREFRAME_TEMPLATES, WIREFRAME_VIEWBOX } from "@/lib/photos/wireframe-templates";
import type { WireframeHighlight, WireframeView } from "@/lib/photos/types";
import { cn } from "@/lib/utils";

type TechnicalWireframeProps = {
  view: WireframeView;
  highlight: WireframeHighlight;
  highlightLabel?: string;
  variant?: "slot" | "detail";
  className?: string;
};

/**
 * Silhueta técnica vetorial — estilo manual automotivo profissional.
 */
export function TechnicalWireframe({
  view,
  highlight,
  highlightLabel,
  variant = "slot",
  className,
}: TechnicalWireframeProps) {
  const paths = WIREFRAME_TEMPLATES[view] ?? WIREFRAME_TEMPLATES.detail;
  const isSlot = variant === "slot";

  const hx = (highlight.x / 100) * 120;
  const hy = (highlight.y / 100) * 90;
  const hw = (highlight.width / 100) * 120;
  const hh = (highlight.height / 100) * 90;

  return (
    <svg
      viewBox={WIREFRAME_VIEWBOX}
      preserveAspectRatio="xMidYMid meet"
      className={cn("h-full w-full", isSlot ? "text-slate-400/80" : "", className)}
      aria-hidden
    >
      <path
        d={paths}
        fill="none"
        stroke={isSlot ? "currentColor" : GUIDE_COLORS.wireframeStroke}
        strokeWidth={isSlot ? "1.1" : "0.9"}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        x={hx}
        y={hy}
        width={hw}
        height={hh}
        rx={highlight.rx ?? 2}
        fill={GUIDE_COLORS.highlightFill}
        fillOpacity={isSlot ? 0.14 : 0.22}
        stroke={GUIDE_COLORS.highlightStroke}
        strokeWidth={isSlot ? 1 : 1.2}
        strokeOpacity={isSlot ? 0.5 : 1}
        strokeDasharray={isSlot ? "2.5 2" : undefined}
      />
      {highlightLabel && !isSlot && (
        <text
          x={hx + hw / 2}
          y={hy + hh / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={GUIDE_COLORS.highlightStroke}
          fontSize="5"
          fontWeight="600"
        >
          {highlightLabel}
        </text>
      )}
    </svg>
  );
}
