import { PUBLIC_IMAGES } from "@/lib/public-images";
import { cn } from "@/lib/utils";

const MARK_SRC = PUBLIC_IMAGES.brand.mark;

/** Monograma “T” da marca Torres — sidebar recolhida. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <img
      src={MARK_SRC}
      alt="Torres Vistoria"
      draggable={false}
      decoding="async"
      className={cn("shrink-0 select-none object-contain", className)}
    />
  );
}
