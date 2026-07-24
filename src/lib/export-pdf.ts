import type { TDocumentDefinitions } from "pdfmake/interfaces";
import { optimizePdfBlob } from "@/lib/optimize-pdf";

type ExportPdfColumn<T> = {
  header: string;
  key: keyof T;
};

type PdfMakeDocument = {
  createPdf: (definition: TDocumentDefinitions) => {
    getBlob: (cb: (blob: Blob) => void) => void;
  };
};

async function getPdfMake(): Promise<PdfMakeDocument> {
  const pdfMake = await import("pdfmake/build/pdfmake");
  const pdfFonts = await import("pdfmake/build/vfs_fonts");
  const pdfDoc = pdfMake.default ?? pdfMake;
  const fonts = (pdfFonts as { default?: { pdfMake?: { vfs: unknown } } }).default?.pdfMake?.vfs;

  if (fonts) {
    (pdfDoc as { vfs?: unknown }).vfs = fonts;
  }

  return pdfDoc as unknown as PdfMakeDocument;
}

function formatPdfValue(value: unknown): string {
  if (value == null) return "";
  return String(value);
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  try {
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.rel = "noopener";
    anchor.click();
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function exportToPdf<T extends Record<string, unknown>>(
  rows: T[],
  columns: ExportPdfColumn<T>[],
  filename: string,
  title: string,
  subtitle?: string,
): Promise<void> {
  const pdfDoc = await getPdfMake();
  const body = [
    columns.map((column) => ({ text: column.header, style: "tableHeader" })),
    ...rows.map((row) => columns.map((column) => formatPdfValue(row[column.key]))),
  ];

  const definition: TDocumentDefinitions = {
    pageOrientation: columns.length > 4 ? "landscape" : "portrait",
    pageMargins: [32, 40, 32, 40],
    content: [
      { text: title, style: "title" },
      ...(subtitle ? [{ text: subtitle, style: "subtitle" }] : []),
      {
        text: `Gerado em ${new Intl.DateTimeFormat("pt-BR", {
          dateStyle: "short",
          timeStyle: "short",
        }).format(new Date())}`,
        style: "generatedAt",
      },
      {
        table: {
          headerRows: 1,
          widths: columns.map(() => "*"),
          body,
        },
        layout: "lightHorizontalLines",
      },
    ],
    styles: {
      title: { fontSize: 16, bold: true, margin: [0, 0, 0, 4] },
      subtitle: { fontSize: 9, color: "#64748b", margin: [0, 0, 0, 4] },
      generatedAt: { fontSize: 8, color: "#64748b", margin: [0, 0, 0, 16] },
      tableHeader: { bold: true, color: "#ffffff", fillColor: "#ea580c" },
    },
    defaultStyle: {
      fontSize: 9,
    },
  };

  const rawBlob = await new Promise<Blob>((resolve) => {
    pdfDoc.createPdf(definition).getBlob(resolve);
  });
  const optimized = await optimizePdfBlob(rawBlob);
  triggerDownload(optimized, filename);
}
