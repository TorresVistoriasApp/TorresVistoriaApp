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
  label?: string;
};

const WHEEL_FILL_IDS = new Set(["wheel-front", "wheel-rear", "wheel-l", "wheel-r"]);
const GLASS_FILL_IDS = new Set(["windows", "windshield", "rear-glass", "windshield-t", "rear-glass-t"]);

function fillColor(fillId: string): { fill: string; stroke: string } {
  if (WHEEL_FILL_IDS.has(fillId)) {
    return { fill: ILLUSTRATION_TOKENS.wheelFill, stroke: ILLUSTRATION_TOKENS.wheelStroke };
  }
  if (GLASS_FILL_IDS.has(fillId)) {
    return { fill: ILLUSTRATION_TOKENS.glassFill, stroke: ILLUSTRATION_TOKENS.glassStroke };
  }
  return { fill: ILLUSTRATION_TOKENS.glassFill, stroke: ILLUSTRATION_TOKENS.glassStroke };
}

/**
 * Silhueta automotiva profissional: carro completo visível + peça alvo em azul.
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
  const usesSilhouette = Boolean(illustration.silhouette);

  return (
    <svg
      viewBox={illustration.viewBox}
      preserveAspectRatio="xMidYMid meet"
      className={cn("h-full w-full", className)}
      role="img"
      aria-label={label ?? highlightPart?.label ?? "Guia técnico de captura"}
    >
      <rect x="0" y="0" width="240" height="160" fill={ILLUSTRATION_TOKENS.background} />

      <g transform={isMirrored ? "translate(240,0) scale(-1,1)" : undefined}>
        {usesSilhouette ? (
          <>
            {/* 1. Silhueta base — contorno reconhecível do veículo */}
            <path
              id="vehicle-silhouette"
              d={illustration.silhouette}
              fill={ILLUSTRATION_TOKENS.silhouetteFill}
              stroke={ILLUSTRATION_TOKENS.silhouetteStroke}
              strokeWidth={ILLUSTRATION_TOKENS.silhouetteStrokeWidth}
              strokeLinejoin="round"
              strokeLinecap="round"
            />

            {/* 2. Vidros e rodas */}
            {illustration.fills?.map((item) => {
              const colors = fillColor(item.id);
              return (
                <path
                  key={item.id}
                  id={`fill-${item.id}`}
                  d={item.d}
                  fill={colors.fill}
                  stroke={colors.stroke}
                  strokeWidth={
                    WHEEL_FILL_IDS.has(item.id)
                      ? ILLUSTRATION_TOKENS.wheelStrokeWidth
                      : 0.5
                  }
                  strokeLinejoin="round"
                />
              );
            })}

            {/* 3. Destaque da peça a fotografar */}
            {highlightPart && (
              <path
                id={`part-path-${highlightPart.id}`}
                data-part-id={highlightPart.id}
                data-highlight="true"
                d={highlightPart.d}
                fill={ILLUSTRATION_TOKENS.highlightFill}
                fillOpacity={ILLUSTRATION_TOKENS.highlightFillOpacity}
                stroke={ILLUSTRATION_TOKENS.highlightStroke}
                strokeWidth={ILLUSTRATION_TOKENS.highlightStrokeWidth}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            )}

            {/* 4. Detalhes técnicos por cima */}
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
          </>
        ) : (
          <>
            {illustration.parts
              .filter((part) => part.id !== highlightPartId)
              .map((part) => (
                <path
                  key={part.id}
                  id={`part-path-${part.id}`}
                  data-part-id={part.id}
                  d={part.d}
                  fill={ILLUSTRATION_TOKENS.panelFill}
                  stroke={ILLUSTRATION_TOKENS.panelStroke}
                  strokeWidth={ILLUSTRATION_TOKENS.panelStrokeWidth}
                  strokeLinejoin="round"
                />
              ))}

            {highlightPart && (
              <path
                id={`part-path-${highlightPart.id}`}
                data-part-id={highlightPart.id}
                data-highlight="true"
                d={highlightPart.d}
                fill={ILLUSTRATION_TOKENS.highlightFill}
                fillOpacity={ILLUSTRATION_TOKENS.highlightFillOpacity}
                stroke={ILLUSTRATION_TOKENS.highlightStroke}
                strokeWidth={ILLUSTRATION_TOKENS.highlightStrokeWidth}
                strokeLinejoin="round"
              />
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
          </>
        )}
      </g>
    </svg>
  );
}
