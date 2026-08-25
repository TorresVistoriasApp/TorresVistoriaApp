import { ImageIcon } from "lucide-react";
import { GUIDE_COLORS } from "@/modules/torres-vistoria/domain/photos/guide-tokens";
import { cn } from "@/shared/lib/utils";

type PhotoExamplePlaceholderProps = {
  exampleImageUrl?: string | null;
  categoryName: string;
  className?: string;
};

/** Espaço reservado para foto modelo — substituível por URL futura. */
export function PhotoExamplePlaceholder({
  exampleImageUrl,
  categoryName,
  className,
}: PhotoExamplePlaceholderProps) {
  if (exampleImageUrl) {
    return (
      <div className={cn("overflow-hidden rounded border border-border bg-card", className)}>
        <img
          src={exampleImageUrl}
          alt={`Exemplo — ${categoryName}`}
          className="aspect-[16/9] w-full object-cover"
        />
        <p className="border-t border-border px-2 py-1 text-[8px] font-semibold text-muted-foreground">
          Foto modelo de referência
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex aspect-[16/9] flex-col items-center justify-center gap-1 rounded border border-dashed bg-muted",
        className,
      )}
      style={{ borderColor: GUIDE_COLORS.border }}
    >
      <ImageIcon className="size-4 text-subtle-foreground" strokeWidth={1.25} />
      <span className="px-2 text-center text-[8px] font-semibold leading-tight text-subtle-foreground">
        Foto modelo — em breve
      </span>
    </div>
  );
}
