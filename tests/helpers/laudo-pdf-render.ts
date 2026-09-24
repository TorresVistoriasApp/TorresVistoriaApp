import { PDFDocument } from "pdf-lib";
import { buildLaudoDocDefinition } from "@/modules/torres-vistoria/domain/laudo/laudo-doc-definition";
import type { LaudoPayload } from "@/modules/torres-vistoria/domain/laudo/laudo-model";
import { PDF_TABLE_LAYOUTS } from "@/modules/torres-vistoria/domain/laudo/pdf/pdf-table-layouts";
import { applyTorresOfficialPdfBinding } from "@/shared/lib/pdf-binding-markers";

export async function createPdfBufferFromDefinition(
  docDefinition: Record<string, unknown>,
): Promise<Uint8Array> {
  const pdfMakeModule = await import("pdfmake/build/pdfmake");
  const pdfFontsModule = await import("pdfmake/build/vfs_fonts");
  const pdfMake = (pdfMakeModule as { default?: unknown }).default ?? pdfMakeModule;
  const fontsModule = pdfFontsModule as {
    default?: { pdfMake?: { vfs: Record<string, string> }; vfs?: Record<string, string> };
    pdfMake?: { vfs: Record<string, string> };
    vfs?: Record<string, string>;
  };
  const vfs =
    fontsModule.default?.pdfMake?.vfs ??
    fontsModule.default?.vfs ??
    fontsModule.pdfMake?.vfs ??
    fontsModule.vfs;
  if (vfs) {
    (pdfMake as { vfs?: Record<string, string> }).vfs = vfs;
  }
  (pdfMake as { tableLayouts?: Record<string, unknown> }).tableLayouts = PDF_TABLE_LAYOUTS;

  return await new Promise<Uint8Array>((resolve, reject) => {
    try {
      const pdf = (pdfMake as { createPdf: (def: unknown) => { getBuffer: (cb: (b: Buffer) => void) => void } })
        .createPdf(docDefinition);
      pdf.getBuffer((buffer: Buffer) => {
        resolve(new Uint8Array(buffer));
      });
    } catch (error) {
      reject(error);
    }
  });
}

export async function renderLaudoPdfBytes(
  payload: LaudoPayload,
  options: { preview?: boolean } = {},
): Promise<Uint8Array> {
  const docDefinition = buildLaudoDocDefinition(payload) as Record<string, unknown>;
  if (options.preview) {
    docDefinition.watermark = {
      text: "PREVIA — NAO OFICIAL",
      color: "#b45309",
      opacity: 0.12,
      bold: true,
      fontSize: 46,
    };
  } else if (payload.contentDigest && payload.verificationCode) {
    applyTorresOfficialPdfBinding(docDefinition, payload.verificationCode, payload.contentDigest);
  }
  return createPdfBufferFromDefinition(docDefinition);
}

export async function analyzePdfBytes(bytes: Uint8Array): Promise<{
  pageCount: number;
  imageObjectCount: number;
  isPdfHeader: boolean;
}> {
  const isPdfHeader =
    bytes.length >= 4 &&
    bytes[0] === 0x25 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x44 &&
    bytes[3] === 0x46;

  const latin = new TextDecoder("latin1").decode(bytes);
  const imageObjectCount = (latin.match(/\/Subtype\s*\/Image/g) ?? []).length;

  let pageCount = 0;
  if (isPdfHeader) {
    const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
    pageCount = doc.getPageCount();
  }

  return { pageCount, imageObjectCount, isPdfHeader };
}

export function base64ByteLength(binaryLength: number): number {
  return Math.ceil(binaryLength / 3) * 4;
}

export function estimateSealRequestBytes(pdfBytes: number): number {
  const b64 = base64ByteLength(pdfBytes);
  return b64 + 512;
}
