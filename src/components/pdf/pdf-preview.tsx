import type { Inspection } from "@/services/inspection-service";
import type { ChecklistItem } from "@/services/checklist-service";
import type { InspectionPhoto } from "@/services/photo-service";
import type { LaudoCompany, LaudoInspector, LaudoSettings } from "@/lib/laudo/laudo-model";
import { LaudoTemplate } from "@/components/pdf/laudo-template";

export function PdfPreview({
  inspection,
  checklist,
  photos = [],
  company,
  settings,
  inspector,
}: {
  inspection: Inspection;
  checklist: ChecklistItem[];
  photos?: InspectionPhoto[];
  company?: LaudoCompany | null;
  settings?: LaudoSettings | null;
  inspector?: LaudoInspector | null;
}) {
  return (
    <div className="max-h-[min(60vh,520px)] overflow-y-auto rounded-lg border border-border/60 bg-muted/10 p-2 sm:p-3">
      <LaudoTemplate
        inspection={inspection}
        checklist={checklist}
        photos={photos}
        company={company}
        settings={settings}
        inspector={inspector}
      />
    </div>
  );
}
