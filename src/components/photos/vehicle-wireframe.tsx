import type { WireframeView } from "@/lib/photos/types";
import { cn } from "@/lib/utils";

type VehicleWireframeProps = {
  view: WireframeView;
  highlight?: { x: number; y: number; width: number; height: number; rx?: number };
  arrowAngle?: number;
  /** slot = guia embutido no card; sheet = modal com destaque forte */
  variant?: "slot" | "sheet";
  className?: string;
};

function CarSilhouette({ view }: { view: WireframeView }) {
  if (view === "document") {
    return (
      <g stroke="currentColor" strokeWidth="1.2" fill="none">
        <rect x="20" y="18" width="60" height="64" rx="3" />
        <line x1="28" y1="30" x2="72" y2="30" />
        <line x1="28" y1="42" x2="72" y2="42" />
        <line x1="28" y1="54" x2="60" y2="54" />
      </g>
    );
  }

  if (view === "wheel") {
    return (
      <g stroke="currentColor" strokeWidth="1.2" fill="none">
        <circle cx="50" cy="50" r="28" />
        <circle cx="50" cy="50" r="16" />
        <line x1="50" y1="22" x2="50" y2="78" />
        <line x1="22" y1="50" x2="78" y2="50" />
      </g>
    );
  }

  if (view === "interior") {
    return (
      <g stroke="currentColor" strokeWidth="1.2" fill="none">
        <path d="M18 62 L28 28 L72 28 L82 62 Z" />
        <rect x="30" y="34" width="40" height="18" rx="2" />
        <circle cx="50" cy="42" r="10" />
        <line x1="50" y1="52" x2="50" y2="62" />
      </g>
    );
  }

  if (view === "engine" || view === "trunk") {
    return (
      <g stroke="currentColor" strokeWidth="1.2" fill="none">
        <rect x="16" y="24" width="68" height="52" rx="4" />
        <line x1="16" y1="38" x2="84" y2="38" />
        <rect x="24" y="44" width="20" height="24" rx="2" />
        <rect x="56" y="44" width="20" height="24" rx="2" />
        <line x1="40" y1="44" x2="40" y2="68" />
        <line x1="60" y1="44" x2="60" y2="68" />
      </g>
    );
  }

  if (view === "exterior_rear") {
    return (
      <g stroke="currentColor" strokeWidth="1.2" fill="none">
        <path d="M22 58 L30 24 L70 24 L78 58 Z" />
        <rect x="34" y="58" width="32" height="8" rx="1" />
        <circle cx="28" cy="58" r="6" />
        <circle cx="72" cy="58" r="6" />
        <line x1="50" y1="24" x2="50" y2="58" />
      </g>
    );
  }

  if (view === "exterior_front") {
    return (
      <g stroke="currentColor" strokeWidth="1.2" fill="none">
        <path d="M22 58 L30 22 L70 22 L78 58 Z" />
        <rect x="34" y="52" width="32" height="8" rx="1" />
        <circle cx="28" cy="58" r="6" />
        <circle cx="72" cy="58" r="6" />
        <line x1="50" y1="22" x2="50" y2="52" />
      </g>
    );
  }

  if (view === "detail") {
    return (
      <g stroke="currentColor" strokeWidth="1.2" fill="none">
        <rect x="22" y="28" width="56" height="32" rx="3" />
        <line x1="28" y1="36" x2="72" y2="36" />
        <line x1="28" y1="44" x2="58" y2="44" />
      </g>
    );
  }

  return (
    <g stroke="currentColor" strokeWidth="1.2" fill="none">
      <path d="M12 58 Q12 42 22 38 L34 36 L42 24 L68 24 L76 36 L88 38 Q98 42 98 58 Z" />
      <circle cx="28" cy="58" r="7" />
      <circle cx="82" cy="58" r="7" />
      <line x1="42" y1="30" x2="68" y2="30" />
      <path d="M42 24 L42 36 M68 24 L68 36" />
    </g>
  );
}

export function VehicleWireframe({
  view,
  highlight,
  arrowAngle,
  variant = "slot",
  className,
}: VehicleWireframeProps) {
  const hx = highlight?.x ?? 0;
  const hy = highlight?.y ?? 0;
  const hw = highlight?.width ?? 0;
  const hh = highlight?.height ?? 0;
  const hr = highlight?.rx ?? 4;
  const isSlot = variant === "slot";

  return (
    <svg
      viewBox="0 0 100 80"
      preserveAspectRatio="xMidYMid meet"
      className={cn(
        "h-full w-full",
        isSlot ? "text-slate-400/70" : "text-muted-foreground/60",
        className,
      )}
      aria-hidden
    >
      <CarSilhouette view={view} />
      {highlight && (
        <>
          <rect
            x={hx}
            y={hy}
            width={hw}
            height={hh}
            rx={hr}
            fill={isSlot ? "var(--color-primary)" : "var(--color-primary)"}
            fillOpacity={isSlot ? 0.12 : 0.35}
            stroke="var(--color-primary)"
            strokeWidth={isSlot ? 1 : 1.5}
            strokeOpacity={isSlot ? 0.45 : 1}
            strokeDasharray={isSlot ? "2 2" : "3 2"}
          />
          {!isSlot && arrowAngle != null && (
            <g transform={`translate(${hx + hw / 2}, ${hy + hh / 2}) rotate(${arrowAngle})`}>
              <path
                d="M-8 0 L8 0 M8 0 L3 -5 M8 0 L3 5"
                stroke="var(--color-primary)"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              />
            </g>
          )}
        </>
      )}
    </svg>
  );
}
