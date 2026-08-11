import { cn } from "@/shared/lib/utils";

interface ConsultaBrandLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showSubtitle?: boolean;
}

const sizeStyles = {
  sm: { text: "text-sm", sub: "text-[10px]" },
  md: { text: "text-base", sub: "text-xs" },
  lg: { text: "text-lg sm:text-xl", sub: "text-xs sm:text-sm" },
};

export function ConsultaBrandLogo({
  className,
  size = "md",
  showSubtitle = true,
}: ConsultaBrandLogoProps) {
  const s = sizeStyles[size];

  return (
    <div className={cn("flex flex-col leading-tight", className)}>
      <span className={cn("font-extrabold tracking-tight text-foreground", s.text)}>
        Torres <span className="text-primary">Consulta</span>
      </span>
      {showSubtitle && (
        <span className={cn("font-medium text-muted-foreground", s.sub)}>
          Consulta veicular para você
        </span>
      )}
    </div>
  );
}
