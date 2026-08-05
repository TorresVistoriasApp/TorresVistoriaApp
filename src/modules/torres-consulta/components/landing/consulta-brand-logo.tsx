import { PUBLIC_IMAGES } from "@/shared/lib/public-images";
import { cn } from "@/shared/lib/utils";

interface ConsultaBrandLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showSubtitle?: boolean;
}

const sizeStyles = {
  sm: { image: "h-8", text: "text-sm", sub: "text-[10px]" },
  md: { image: "h-10", text: "text-base", sub: "text-xs" },
  lg: { image: "h-12 sm:h-14", text: "text-lg sm:text-xl", sub: "text-xs sm:text-sm" },
};

export function ConsultaBrandLogo({
  className,
  size = "md",
  showSubtitle = true,
}: ConsultaBrandLogoProps) {
  const s = sizeStyles[size];

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <img
        src={PUBLIC_IMAGES.brand.trim}
        alt=""
        className={cn("w-auto shrink-0 object-contain", s.image)}
        width={120}
        height={53}
        decoding="async"
        draggable={false}
        aria-hidden
      />
      <div className="flex flex-col leading-tight">
        <span className={cn("font-extrabold tracking-tight text-foreground", s.text)}>
          Torres <span className="text-primary">Consulta</span>
        </span>
        {showSubtitle && (
          <span className={cn("font-medium text-muted-foreground", s.sub)}>
            Consulta veicular para você
          </span>
        )}
      </div>
    </div>
  );
}
