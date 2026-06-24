import { PUBLIC_IMAGES } from "@/lib/public-images";
import { cn } from "@/lib/utils";

const LOGO_SRC = PUBLIC_IMAGES.brand.trim;

interface BrandLogoProps {
  className?: string;
  showTagline?: boolean;
  size?: "sm" | "md" | "lg";
}

const sizeStyles = {
  sm: { image: "h-9 sm:h-10", tagline: "text-xs" },
  md: { image: "h-10 sm:h-12", tagline: "text-sm" },
  lg: { image: "h-14 sm:h-16", tagline: "text-sm" },
};

export function BrandLogo({ className, showTagline = false, size = "md" }: BrandLogoProps) {
  const s = sizeStyles[size];

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <img
        src={LOGO_SRC}
        alt="Torres Vistoria"
        className={cn("w-auto shrink-0 object-contain object-left", s.image)}
        width={300}
        height={133}
        decoding="async"
        draggable={false}
      />
      {showTagline && (
        <p className={cn("text-muted-foreground", s.tagline)}>Vistoria cautelar veicular</p>
      )}
    </div>
  );
}
