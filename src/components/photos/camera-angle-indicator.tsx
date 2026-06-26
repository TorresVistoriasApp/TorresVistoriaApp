import { GUIDE_COLORS } from "@/lib/photos/guide-tokens";
import type { CameraAngleGuide } from "@/lib/photos/types";
import { cn } from "@/lib/utils";

type CameraAngleIndicatorProps = {
  camera: CameraAngleGuide;
  className?: string;
};

/**
 * Indicador de posicionamento do smartphone — rotação, inclinação, direção e distância.
 */
export function CameraAngleIndicator({ camera, className }: CameraAngleIndicatorProps) {
  const transform = `rotate(${camera.rotation + camera.tilt * 0.3} 24 32)`;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-1 rounded-md border border-slate-200 bg-white p-1.5",
        className,
      )}
    >
      <svg viewBox="0 0 48 64" className="h-14 w-10 sm:h-16 sm:w-11" aria-hidden>
        <g transform={transform}>
          <rect
            x="14"
            y="8"
            width="20"
            height="36"
            rx="3"
            fill={GUIDE_COLORS.surface}
            stroke={GUIDE_COLORS.wireframeStroke}
            strokeWidth="1"
          />
          <rect x="17" y="12" width="14" height="24" rx="1" fill={GUIDE_COLORS.wireframeMuted} />
          <circle cx="24" cy="40" r="2" fill={GUIDE_COLORS.wireframeStroke} />
        </g>
        <g
          transform={`translate(24, 52) rotate(${camera.direction})`}
        >
          <path
            d="M-14 0 H6 M6 0 L0 -4 M6 0 L0 4"
            fill="none"
            stroke={GUIDE_COLORS.highlightStroke}
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </g>
      </svg>
      <span className="text-center text-[8px] font-medium leading-tight text-slate-500">
        {camera.distance}
      </span>
      {camera.targetLabel && (
        <span className="line-clamp-2 text-center text-[7px] leading-tight text-blue-900/80">
          {camera.targetLabel}
        </span>
      )}
    </div>
  );
}
