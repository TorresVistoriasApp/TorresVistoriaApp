import { ILLUSTRATION_TOKENS } from "@/lib/photos/illustrations/tokens";
import {
  getIllustration,
  getIllustrationPart,
} from "@/lib/photos/illustrations/catalog";
import type { TechnicalIllustrationId } from "@/lib/photos/illustrations/types";
import { cn } from "@/lib/utils";

type TechnicalIllustrationProps = {
  illustrationId: TechnicalIllustrationId;
  highlightPartId: string;
  className?: string;
  /** aria-label para acessibilidade */
  label?: string;
};

const GLASS_PART_IDS = new Set([
  "windshield",
  "front-door-glass",
  "rear-door-glass",
  "rear-quarter-glass",
  "windshield-top",
  "rear-glass",
  "side-glass",
  "glass-engraving",
]);

const RUBBER_PART_IDS = new Set(["front-wheel", "rear-wheel", "tire", "full-wheel", "spare-tire"]);

function partStyle(partId: string, isHighlight: boolean) {
  if (isHighlight) {
    return {
      fill: ILLUSTRATION_TOKENS.highlightFill,
      fillOpacity: ILLUSTRATION_TOKENS.highlightFillOpacity,
      stroke: ILLUSTRATION_TOKENS.highlightStroke,
      strokeWidth: ILLUSTRATION_TOKENS.highlightStrokeWidth,
    };
  }

  if (GLASS_PART_IDS.has(partId)) {
    return {
      fill: ILLUSTRATION_TOKENS.glassFill,
      fillOpacity: 1,
      stroke: ILLUSTRATION_TOKENS.glassStroke,
      strokeWidth: ILLUSTRATION_TOKENS.panelStrokeWidth,
    };
  }

  if (RUBBER_PART_IDS.has(partId)) {
    return {
      fill: ILLUSTRATION_TOKENS.rubberFill,
      fillOpacity: 1,
      stroke: ILLUSTRATION_TOKENS.rubberStroke,
      strokeWidth: ILLUSTRATION_TOKENS.panelStrokeWidth,
    };
  }

  return {
    fill: ILLUSTRATION_TOKENS.panelFill,
    fillOpacity: 1,
    stroke: ILLUSTRATION_TOKENS.panelStroke,
    strokeWidth: ILLUSTRATION_TOKENS.panelStrokeWidth,
  };
}

/**
 * Renderizador de ilustrações técnicas automotivas.
 * Cada peça possui ID único para animação, IA e AR futuros.
 */
export function TechnicalIllustration({
  illustrationId,
  highlightPartId,
  className,
  label,
}: TechnicalIllustrationProps) {
  const illustration = getIllustration(illustrationId);
  const highlightPart = getIllustrationPart(illustrationId, highlightPartId);
  const isMirrored = illustrationId === "vehicle-side-right";

  return (
    <svg
      viewBox={illustration.viewBox}
      preserveAspectRatio="xMidYMid meet"
      className={cn("h-full w-full", className)}
      role="img"
      aria-label={label ?? highlightPart?.label ?? "Guia técnico de captura"}
    >
      <rect
        x="0"
        y="0"
        width="240"
        height="160"
        fill={ILLUSTRATION_TOKENS.background}
      />

      <g transform={isMirrored ? "translate(240,0) scale(-1,1)" : undefined}>
        {illustration.parts
          .filter((part) => part.id !== highlightPartId)
          .map((part) => {
            const style = partStyle(part.id, false);

            return (
              <g key={part.id} id={`illustration-part-${part.id}`} data-part-id={part.id}>
                <path
                  id={`part-path-${part.id}`}
                  d={part.d}
                  fill={style.fill}
                  fillOpacity={style.fillOpacity}
                  stroke={style.stroke}
                  strokeWidth={style.strokeWidth}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                {part.details?.map((detail) => (
                  <path
                    key={detail.id}
                    id={`part-detail-${detail.id}`}
                    d={detail.d}
                    fill="none"
                    stroke={ILLUSTRATION_TOKENS.structureStroke}
                    strokeWidth={detail.strokeWidth ?? ILLUSTRATION_TOKENS.structureStrokeWidth}
                    opacity={detail.opacity ?? 1}
                    strokeLinecap="round"
                  />
                ))}
              </g>
            );
          })}

        {highlightPart && (
          <g
            id={`illustration-part-${highlightPart.id}`}
            data-part-id={highlightPart.id}
            data-highlight="true"
          >
            <path
              id={`part-path-${highlightPart.id}`}
              d={highlightPart.d}
              fill={ILLUSTRATION_TOKENS.highlightFill}
              fillOpacity={ILLUSTRATION_TOKENS.highlightFillOpacity}
              stroke={ILLUSTRATION_TOKENS.highlightStroke}
              strokeWidth={ILLUSTRATION_TOKENS.highlightStrokeWidth}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {highlightPart.details?.map((detail) => (
              <path
                key={detail.id}
                id={`part-detail-${detail.id}`}
                d={detail.d}
                fill="none"
                stroke={ILLUSTRATION_TOKENS.highlightStroke}
                strokeWidth={detail.strokeWidth ?? ILLUSTRATION_TOKENS.structureStrokeWidth}
                opacity={detail.opacity ?? 0.8}
                strokeLinecap="round"
              />
            ))}
          </g>
        )}

        {illustration.structure.map((stroke) => (
          <path
            key={stroke.id}
            id={`structure-${stroke.id}`}
            d={stroke.d}
            fill="none"
            stroke={ILLUSTRATION_TOKENS.structureStroke}
            strokeWidth={stroke.strokeWidth ?? ILLUSTRATION_TOKENS.structureStrokeWidth}
            opacity={stroke.opacity ?? 1}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
      </g>
    </svg>
  );
}
