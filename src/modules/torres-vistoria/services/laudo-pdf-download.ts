import type { Inspection } from "@/modules/torres-vistoria/services/inspection-service";
import type { ChecklistItem } from "@/modules/torres-vistoria/services/checklist-service";
import type { InspectionPhoto } from "@/modules/torres-vistoria/services/photo-service";
import type { LaudoCompany, LaudoInspector, LaudoSettings } from "@/modules/torres-vistoria/domain/laudo/laudo-model";
import { pdfService } from "@/modules/torres-vistoria/services/pdf-service";

export type LaudoTemplateDownloadParams = {
  inspection: Inspection;
  checklist: ChecklistItem[];
  photos?: InspectionPhoto[];
  company?: LaudoCompany | null;
  settings?: LaudoSettings | null;
  inspector?: LaudoInspector | null;
  preview: boolean;
  verificationCode?: string;
  integrityHash?: string;
  validationUrl?: string;
};

function reportFileName(inspection: Pick<Inspection, "inspection_number" | "plate">): string {
  const safePlate = inspection.plate.replace(/[^A-Z0-9]/gi, "").toUpperCase();
  return `laudo-${inspection.inspection_number}-${safePlate}.pdf`;
}

/** Mesmo pipeline do botão "Baixar prévia" — única diferença é `preview` (marca d'água e códigos). */
export async function downloadLaudoTemplatePdf(params: LaudoTemplateDownloadParams): Promise<Blob> {
  const { docDefinition } = await pdfService.generateLaudoPayload(
    params.inspection,
    params.checklist,
    params.photos ?? [],
    {
      company: params.company,
      settings: params.settings,
      inspector: params.inspector,
      preview: params.preview,
      verificationCode: params.verificationCode,
      integrityHash: params.integrityHash,
      validationUrl: params.validationUrl,
    },
  );
  const blob = await pdfService.createPdfBlob(docDefinition);
  await pdfService.downloadPdfBlob(blob, reportFileName(params.inspection));
  return blob;
}

export async function laudoPdfBlobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? "");
      const comma = result.indexOf(",");
      resolve(comma >= 0 ? result.slice(comma + 1) : result);
    };
    reader.onerror = () => reject(reader.error ?? new Error("Falha ao ler o PDF"));
    reader.readAsDataURL(blob);
  });
}
