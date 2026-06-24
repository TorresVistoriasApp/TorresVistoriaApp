import { pdfService } from "@/services/pdf-service";
import type { Inspection } from "@/services/inspection-service";
import type { ChecklistItem } from "@/services/checklist-service";
import type { InspectionPhoto } from "@/services/photo-service";
import type { LaudoCompany, LaudoInspector, LaudoSettings } from "@/lib/laudo/laudo-model";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useState } from "react";

export function PdfDownloadButton({
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
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const { docDefinition } = await pdfService.generateLaudoPayload(inspection, checklist, photos, {
        company,
        settings,
        inspector,
      });
      await pdfService.downloadLaudo(
        docDefinition,
        `laudo-${inspection.inspection_number}-${inspection.plate}.pdf`,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={() => void handleDownload()} disabled={loading}>
      <Download className="h-4 w-4" />
      {loading ? "Gerando PDF..." : "Baixar laudo PDF"}
    </Button>
  );
}
