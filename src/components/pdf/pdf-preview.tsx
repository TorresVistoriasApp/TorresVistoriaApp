import type { Inspection } from "@/services/inspection-service";
import type { ChecklistItem } from "@/services/checklist-service";
import { LaudoTemplate } from "@/components/pdf/laudo-template";

export function PdfPreview({
  inspection,
  checklist,
}: {
  inspection: Inspection;
  checklist: ChecklistItem[];
}) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-muted/20 p-4">
      <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Pré-visualização do laudo
      </p>
      <LaudoTemplate inspection={inspection} checklist={checklist} />
    </div>
  );
}
