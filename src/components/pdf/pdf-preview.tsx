import type { Inspection } from "@/services/inspection-service";
import type { ChecklistItem } from "@/services/checklist-service";
import type { InspectionPhoto } from "@/services/photo-service";
import type { LaudoCompany, LaudoInspector, LaudoSettings } from "@/lib/laudo/laudo-model";
import { LaudoTemplate } from "@/components/pdf/laudo-template";
import { Eye } from "lucide-react";

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
    <div className="overflow-hidden rounded-xl border border-border bg-muted/10 shadow-soft">
      <div className="flex items-center gap-2 border-b border-border bg-card px-4 py-2.5">
        <Eye className="size-4 text-muted-foreground" aria-hidden />
        <p className="text-xs font-medium text-muted-foreground">
          Visualização simplificada, o PDF final inclui fotos completas, checklist detalhado e QR de
          validação
        </p>
      </div>
      <div className="max-h-[520px] overflow-y-auto p-3 sm:p-4">
        <LaudoTemplate
          inspection={inspection}
          checklist={checklist}
          photos={photos}
          company={company}
          settings={settings}
          inspector={inspector}
        />
      </div>
    </div>
  );
}
