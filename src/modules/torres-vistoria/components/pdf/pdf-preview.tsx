import type { Inspection } from "@/modules/torres-vistoria/services/inspection-service";
import type { ChecklistItem } from "@/modules/torres-vistoria/services/checklist-service";
import type { InspectionPhoto } from "@/modules/torres-vistoria/services/photo-service";
import type { LaudoCompany, LaudoInspector, LaudoSettings } from "@/modules/torres-vistoria/domain/laudo/laudo-model";
import { LaudoTemplate } from "@/modules/torres-vistoria/components/pdf/laudo-template";

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
    <div className="max-h-[min(60vh,520px)] overflow-y-auto rounded-lg border border-border bg-muted p-2 sm:p-3">
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
