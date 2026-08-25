import { TechnicalIllustration } from "@/modules/torres-vistoria/components/photos/technical-illustration";
import { GUIDE_COLORS } from "@/modules/torres-vistoria/domain/photos/guide-tokens";
import type { PhotoTechnicalGuide } from "@/modules/torres-vistoria/domain/photos/types";
import { cn } from "@/shared/lib/utils";

interface PhotoVisualGuidePanelProps {
  categoryName: string;
  guide: PhotoTechnicalGuide;
  className?: string;
}

/** Painel expandido de guia técnico — ilustração vetorial profissional. */
export function PhotoVisualGuidePanel({
  categoryName,
  guide,
  className,
}: PhotoVisualGuidePanelProps) {
  return (
    <div
      className={cn("overflow-hidden rounded-lg border border-border bg-card", className)}
      style={{ backgroundColor: GUIDE_COLORS.surfaceMuted }}
    >
      <div className="aspect-[3/2] p-3">
        <TechnicalIllustration
          illustrationId={guide.illustrationId}
          highlightPartId={guide.highlightPartId}
          label={guide.highlightLabel ?? categoryName}
        />
      </div>
      <p className="border-t border-border px-3 py-2 text-xs leading-snug text-muted-foreground">
        {guide.instruction}
      </p>
    </div>
  );
}
