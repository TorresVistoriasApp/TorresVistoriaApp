import type { Inspection } from "@/services/inspection-service";
import type { ChecklistItem } from "@/services/checklist-service";
import type { InspectionPhoto } from "@/services/photo-service";
import type { LaudoCompany, LaudoInspector, LaudoSettings } from "@/lib/laudo/laudo-model";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { pdfService } from "@/services/pdf-service";

interface PdfDownloadButtonProps {
  inspection: Inspection;
  checklist: ChecklistItem[];
  photos?: InspectionPhoto[];
  company?: LaudoCompany | null;
  settings?: LaudoSettings | null;
  inspector?: LaudoInspector | null;
  disabled?: boolean;
  className?: string;
  variant?: "default" | "outline" | "ghost";
}

export function PdfDownloadButton({
  inspection,
  checklist,
  photos = [],
  company,
  settings,
  inspector,
  disabled,
  className,
  variant = "default",
}: PdfDownloadButtonProps) {
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
    <Button
      type="button"
      variant={variant}
      className={cn(className)}
      onClick={() => void handleDownload()}
      disabled={loading || disabled}
    >
      {loading ? (
        <div className="size-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        <>
          <Download className="mr-2 size-5" />
          Baixar PDF
        </>
      )}
    </Button>
  );
}
