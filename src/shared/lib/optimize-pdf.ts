import { PDFDocument, PDFName } from "pdf-lib";

function clearInfoDict(pdfDoc: PDFDocument): void {
  const info = (
    pdfDoc as unknown as {
      getInfoDict?: () => { delete: (name: ReturnType<typeof PDFName.of>) => void };
    }
  ).getInfoDict?.();

  if (!info) {
    pdfDoc.setTitle("");
    pdfDoc.setAuthor("");
    pdfDoc.setSubject("");
    pdfDoc.setKeywords([]);
    pdfDoc.setCreator("");
    pdfDoc.setProducer("");
    return;
  }

  for (const key of [
    "Title",
    "Author",
    "Subject",
    "Keywords",
    "Creator",
    "Producer",
    "CreationDate",
    "ModDate",
  ]) {
    info.delete(PDFName.of(key));
  }
}

/**
 * Comprime levemente o PDF e remove metadados desnecessários,
 * preservando layout, fontes, texto pesquisável e ordem das páginas.
 *
 * Nota: o pdf-lib pode regravar Producer/ModDate no save; os metadados
 * identificáveis da geração original (título, autor, keywords, etc.) são limpos.
 */
export async function optimizePdfBlob(blob: Blob): Promise<Blob> {
  const bytes = await blob.arrayBuffer();
  const pdfDoc = await PDFDocument.load(bytes, {
    updateMetadata: false,
    ignoreEncryption: true,
  });

  clearInfoDict(pdfDoc);

  const optimized = await pdfDoc.save({
    useObjectStreams: true,
    addDefaultPage: false,
    updateFieldAppearances: false,
  });

  return new Blob([optimized], { type: "application/pdf" });
}
