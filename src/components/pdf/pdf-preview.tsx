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
    <div className="rounded-lg border border-dashed border-border bg-muted/20 p-4">
      <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Pré-visualização do laudo
      </p>
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
