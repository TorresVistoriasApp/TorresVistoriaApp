import { pdfService } from "@/services/pdf-service";
import type { Inspection } from "@/services/inspection-service";
import type { ChecklistItem } from "@/services/checklist-service";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useState } from "react";

export function PdfDownloadButton({
  inspection,
  checklist,
}: {
  inspection: Inspection;
  checklist: ChecklistItem[];
}) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const { docDefinition } = await pdfService.generateLaudoPayload(inspection, checklist);
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
