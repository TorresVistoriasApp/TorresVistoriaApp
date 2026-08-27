import { cn } from "@/shared/lib/utils";

interface ConsultaBrandLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showSubtitle?: boolean;
  onDark?: boolean;
}

const sizeStyles = {
  sm: { mark: "h-8 w-8 rounded-lg text-[12px]", text: "text-[13px]", sub: "text-[10px]", gap: "gap-2.5" },
  md: { mark: "h-9 w-9 rounded-lg text-[14px]", text: "text-[15px]", sub: "text-[11px]", gap: "gap-2.5" },
  lg: { mark: "h-11 w-11 rounded-xl text-base", text: "text-lg sm:text-xl", sub: "text-xs", gap: "gap-3" },
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
          "flex shrink-0 items-center justify-center bg-primary font-bold tracking-tight text-primary-foreground",
          s.mark,
        )}
        aria-hidden
      >
        T
      </span>
      <div className="flex min-w-0 flex-col leading-tight">
        <span
          className={cn(
            "truncate font-bold tracking-[-0.02em]",
            onDark ? "text-white" : "text-foreground",
            s.text,
          )}
        >
          Torres <span className="font-semibold text-primary">Consulta</span>
        </span>
        {showSubtitle && (
          <span
            className={cn(
              "truncate font-medium tracking-wide",
              onDark ? "text-white/45" : "text-muted-foreground",
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
