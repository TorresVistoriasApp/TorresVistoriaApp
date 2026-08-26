import type { Inspection } from "@/modules/torres-vistoria/services/inspection-service";
import type { ChecklistItem } from "@/modules/torres-vistoria/services/checklist-service";
import type { InspectionPhoto } from "@/modules/torres-vistoria/services/photo-service";
import type { LaudoCompany, LaudoInspector, LaudoSettings } from "@/modules/torres-vistoria/domain/laudo/laudo-model";
import { Button } from "@/shared/ui/button";
import { Download } from "lucide-react";
import { useState } from "react";
import { cn } from "@/shared/lib/utils";
import { pdfService } from "@/modules/torres-vistoria/services/pdf-service";

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
      const blob = await pdfService.createPdfBlob(docDefinition);
      await pdfService.downloadPdfBlob(
        blob,
        `laudo-${inspection.inspection_number}-${inspection.plate}.pdf`,
      );
    } catch (error) {
      console.error("[PdfDownloadButton]", error);
      throw error;
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
