import { cn } from "@/shared/lib/utils";

interface ConsultaBrandLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showSubtitle?: boolean;
  onDark?: boolean;
}

const sizeStyles = {
  sm: { mark: "h-8 w-8 rounded-lg text-[13px]", text: "text-sm", sub: "text-[10px]", gap: "gap-2.5" },
  md: { mark: "h-9 w-9 rounded-lg text-[15px]", text: "text-base", sub: "text-[11px]", gap: "gap-2.5" },
  lg: { mark: "h-11 w-11 rounded-xl text-lg", text: "text-lg sm:text-xl", sub: "text-xs", gap: "gap-3" },
};

export function ConsultaBrandLogo({
  className,
  size = "md",
  showSubtitle = true,
  onDark = false,
}: ConsultaBrandLogoProps) {
  const s = sizeStyles[size];

  return (
    <div className={cn("flex items-center", s.gap, className)}>
      <span
        className={cn(
          "flex shrink-0 items-center justify-center bg-primary font-bold text-primary-foreground",
          s.mark,
        )}
        aria-hidden
      >
        T
      </span>
      <div className="flex min-w-0 flex-col leading-tight">
        <span
          className={cn(
            "truncate font-bold tracking-tight",
            onDark ? "text-ink-foreground" : "text-foreground",
            s.text,
          )}
        >
          Torres <span className="font-semibold text-primary">Consulta</span>
        </span>
        {showSubtitle && (
          <span
            className={cn(
              "truncate font-medium",
              onDark ? "text-ink-muted" : "text-muted-foreground",
              s.sub,
            )}
          >
            Consulta veicular para você
          </span>
        )}
      </div>
    </div>
  );
}
