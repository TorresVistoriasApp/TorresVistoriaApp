import { PUBLIC_IMAGES } from "@/shared/lib/public-images";
import { cn } from "@/shared/lib/utils";

const MARK_SRC = PUBLIC_IMAGES.brand.mark;

/** Monograma “T” da marca Torres — sidebar recolhida. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <img
      src={MARK_SRC}
      alt="Torres Vistoria"
      draggable={false}
      decoding="async"
      width={454}
      height={352}
      className={cn("shrink-0 select-none object-contain", className)}
    />
  );
}
