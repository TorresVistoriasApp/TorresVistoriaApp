import { TechnicalIllustration } from "@/components/photos/technical-illustration";
import { GUIDE_COLORS } from "@/lib/photos/guide-tokens";
import type { PhotoTechnicalGuide } from "@/lib/photos/types";
import { cn } from "@/lib/utils";

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
      className={cn("overflow-hidden rounded-lg border border-slate-200 bg-white", className)}
      style={{ backgroundColor: GUIDE_COLORS.surfaceMuted }}
    >
      <div className="aspect-[3/2] p-3">
        <TechnicalIllustration
          illustrationId={guide.illustrationId}
          highlightPartId={guide.highlightPartId}
          label={guide.highlightLabel ?? categoryName}
        />
      </div>
      <p className="border-t border-slate-100 px-3 py-2 text-xs leading-snug text-slate-600">
        {guide.instruction}
      </p>
    </div>
  );
}
