import type { Inspection } from "@/services/inspection-service";
import type { ChecklistItem } from "@/services/checklist-service";
import { formatDate, formatDateTime } from "@/lib/formatters";

async function sha256(text: string): Promise<string> {
  const buffer = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function generateVerificationCode(): string {
  return `TV-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

export const pdfService = {
  async generateLaudoPayload(
    inspection: Inspection,
    checklist: ChecklistItem[],
  ): Promise<{
    verificationCode: string;
    integrityHash: string;
    docDefinition: Record<string, unknown>;
  }> {
    const verificationCode = generateVerificationCode();
    const content = JSON.stringify({ inspection, checklist, verificationCode });
    const integrityHash = await sha256(content);

    const checklistBody = checklist.map((item) => [
      item.category,
      item.item_name,
      item.status,
      item.notes ?? "—",
    ]);

    const docDefinition = {
      pageSize: "A4",
      pageMargins: [40, 60, 40, 60],
      content: [
        { text: "TORRES VISTORIA", style: "header", alignment: "center" },
        { text: `Laudo Nº ${inspection.inspection_number}`, alignment: "center", margin: [0, 8, 0, 16] },
        { text: "Dados do Veículo", style: "subheader" },
        {
          table: {
            widths: ["*", "*"],
            body: [
              ["Placa", inspection.plate],
              ["Marca/Modelo", `${inspection.brand} ${inspection.model}`],
              ["Chassi", inspection.chassis],
              ["Cor", inspection.color],
              ["Situação", inspection.situation],
              ["Parecer", inspection.opinion ?? "Pendente"],
            ],
          },
          layout: "lightHorizontalLines",
          margin: [0, 0, 0, 16],
        },
        { text: "Checklist", style: "subheader" },
        {
          table: {
            headerRows: 1,
            widths: ["auto", "*", "auto", "*"],
            body: [
              ["Categoria", "Item", "Status", "Obs."],
              ...checklistBody,
            ],
          },
          layout: "lightHorizontalLines",
          margin: [0, 0, 0, 16],
        },
        { text: "Observações Técnicas", style: "subheader" },
        { text: inspection.technical_notes ?? "Nenhuma observação.", margin: [0, 0, 0, 16] },
        { text: "Conclusão", style: "subheader" },
        {
          text: `Vistoria realizada em ${formatDate(inspection.inspection_date)} às ${inspection.inspection_time.slice(0, 5)} — Local: ${inspection.location}`,
          margin: [0, 0, 0, 24],
        },
        { text: `Código de verificação: ${verificationCode}`, style: "footer" },
        { text: `Hash SHA-256: ${integrityHash.slice(0, 32)}...`, style: "footer" },
        { text: `Gerado em ${formatDateTime(new Date())}`, style: "footer" },
      ],
      styles: {
        header: { fontSize: 18, bold: true, color: "#1e40af" },
        subheader: { fontSize: 12, bold: true, margin: [0, 8, 0, 4] },
        footer: { fontSize: 8, color: "#64748b" },
      },
      defaultStyle: { fontSize: 10 },
    };

    return { verificationCode, integrityHash, docDefinition };
  },

  async downloadLaudo(docDefinition: Record<string, unknown>, fileName: string): Promise<void> {
    const pdfMake = await import("pdfmake/build/pdfmake");
    const pdfFonts = await import("pdfmake/build/vfs_fonts");
    const pdfDoc = pdfMake.default ?? pdfMake;
    const fonts = (pdfFonts as { default?: { pdfMake?: { vfs: unknown } } }).default?.pdfMake?.vfs;
    if (fonts) {
      (pdfDoc as { vfs?: unknown }).vfs = fonts;
    }
    (pdfDoc as { createPdf: (def: unknown) => { download: (n: string) => void } })
      .createPdf(docDefinition)
      .download(fileName);
  },
};
