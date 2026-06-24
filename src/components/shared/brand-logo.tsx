import { PUBLIC_IMAGES } from "@/lib/public-images";
import { cn } from "@/lib/utils";

const LOGO_SRC = PUBLIC_IMAGES.brand.trim;

interface BrandLogoProps {
  className?: string;
  showTagline?: boolean;
  align?: "left" | "center";
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeStyles = {
  sm: { image: "h-9 sm:h-10", tagline: "text-xs" },
  md: { image: "h-10 sm:h-12", tagline: "text-sm" },
  lg: { image: "h-14 sm:h-16", tagline: "text-sm" },
  xl: {
    image:
      "h-[4.25rem] w-auto max-w-[300px] sm:h-24 sm:max-w-[340px] lg:h-28 lg:max-w-[400px] xl:h-32",
    tagline: "text-base font-semibold tracking-wide sm:text-lg",
  },
};

export function BrandLogo({
  className,
  showTagline = false,
  align = "left",
  size = "md",
}: BrandLogoProps) {
  const s = sizeStyles[size];
  const centered = align === "center";

  return (
    <div className={cn("flex flex-col gap-2", centered && "items-center text-center", className)}>
      <img
        src={LOGO_SRC}
        alt="Torres Vistoria"
        className={cn(
          "w-auto shrink-0 object-contain",
          s.image,
          centered ? "mx-auto object-center" : "object-left",
        )}
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
