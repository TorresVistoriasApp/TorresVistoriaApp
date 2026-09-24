import type { Inspection } from "@/modules/torres-vistoria/services/inspection-service";
import type { ChecklistItem } from "@/modules/torres-vistoria/services/checklist-service";
import type { InspectionPhoto } from "@/modules/torres-vistoria/services/photo-service";
import type { LaudoCompany, LaudoInspector, LaudoSettings } from "@/modules/torres-vistoria/domain/laudo/laudo-model";
import { pdfService } from "@/modules/torres-vistoria/services/pdf-service";

export type LaudoPdfMode = "preview" | "official";

export type GenerateLaudoPdfParams = {
  mode: LaudoPdfMode;
  inspection: Inspection;
  checklist: ChecklistItem[];
  photos?: InspectionPhoto[];
  company?: LaudoCompany | null;
  settings?: LaudoSettings | null;
  inspector?: LaudoInspector | null;
  verificationCode?: string;
  validationUrl?: string;
  /** Digest canônico devolvido pelo servidor no prepare. */
  contentDigest?: string;
  /** SHA-256 do arquivo após o seal (exibido como referência; validação usa o arquivo no Storage). */
  fileIntegrityHash?: string;
};

function reportFileName(inspection: Pick<Inspection, "inspection_number" | "plate">): string {
  const safePlate = inspection.plate.replace(/[^A-Z0-9]/gi, "").toUpperCase();
  return `laudo-${inspection.inspection_number}-${safePlate}.pdf`;
}

/**
 * Pipeline única da template canônica (pdfmake / buildLaudoDocDefinition).
 * Prévia e oficial diferem apenas em metadados e marca d'água.
 */
export async function generateLaudoPdf(params: GenerateLaudoPdfParams): Promise<Blob> {
  const preview = params.mode === "preview";
  const integrityHash = preview
    ? "preview"
    : params.fileIntegrityHash ?? params.contentDigest ?? "PENDENTE";

  const { docDefinition } = await pdfService.generateLaudoPayload(
    params.inspection,
    params.checklist,
    params.photos ?? [],
    {
      company: params.company,
      settings: params.settings,
      inspector: params.inspector,
      preview,
      verificationCode: params.verificationCode,
      validationUrl: params.validationUrl,
      integrityHash,
      contentDigest: preview ? undefined : params.contentDigest,
      fileIntegrityHash: preview ? undefined : params.fileIntegrityHash,
    },
  );

  return pdfService.createPdfBlob(docDefinition);
}

export async function downloadLaudoPdf(
  params: GenerateLaudoPdfParams,
): Promise<Blob> {
  const blob = await generateLaudoPdf(params);
  await pdfService.downloadPdfBlob(blob, reportFileName(params.inspection));
  return blob;
}

/** @deprecated use downloadLaudoPdf */
export async function downloadLaudoTemplatePdf(
  params: GenerateLaudoPdfParams & { preview: boolean },
): Promise<Blob> {
  return downloadLaudoPdf({
    ...params,
    mode: params.preview ? "preview" : "official",
  });
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
