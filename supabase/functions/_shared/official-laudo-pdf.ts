import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "https://esm.sh/pdf-lib@1.17.1";

/** Helvetica (WinAnsi) cobre o português usado no laudo oficial. */
function pdfText(value: unknown): string {
  const raw = value == null ? "" : String(value);
  return raw
    .normalize("NFC")
    .replace(/[^\x20-\x7EÀ-ÿ]/g, (char) => {
      const map: Record<string, string> = {
        "—": "-",
        "–": "-",
        "“": '"',
        "”": '"',
        "‘": "'",
        "’": "'",
        "•": "-",
      };
      return map[char] ?? "?";
    })
    .trim();
}

export type OfficialChecklistItem = {
  category: string;
  item_name: string;
  status: string;
  notes: string | null;
};

export type OfficialPhotoItem = {
  category: string;
  storage_path: string;
};

export type OfficialCompany = {
  trade_name?: string | null;
  legal_name?: string | null;
  document?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  address_street?: string | null;
  address_number?: string | null;
  address_neighborhood?: string | null;
  address_city?: string | null;
  address_state?: string | null;
  address_cep?: string | null;
};

export type OfficialInspection = {
  inspection_number: number;
  inspection_date: string;
  inspection_time?: string | null;
  location?: string | null;
  inspection_purpose?: string | null;
  plate: string | null;
  chassis: string | null;
  renavam?: string | null;
  brand?: string | null;
  model?: string | null;
  version?: string | null;
  color?: string | null;
  fuel?: string | null;
  manufacture_year?: number | null;
  model_year?: number | null;
  mileage?: number | null;
  client_name?: string | null;
  client_document?: string | null;
  client_phone?: string | null;
  client_email?: string | null;
  requester_name?: string | null;
  requester_document?: string | null;
  opinion?: string | null;
  technical_notes?: string | null;
};

export type OfficialLaudoInput = {
  inspection: OfficialInspection;
  company: OfficialCompany | null;
  inspectorName: string | null;
  checklist: OfficialChecklistItem[];
  photos: OfficialPhotoItem[];
  verificationCode: string;
  validationUrl: string;
  issuedAt: string;
};

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 42;
const NAVY = rgb(0.12, 0.23, 0.37);
const ORANGE = rgb(0.91, 0.47, 0.18);
const MUTED = rgb(0.35, 0.4, 0.45);
const BLACK = rgb(0.12, 0.14, 0.16);

function companyAddress(company: OfficialCompany | null): string {
  if (!company) return "";
  const parts = [
    company.address_street,
    company.address_number,
    company.address_neighborhood,
    company.address_city,
    company.address_state,
    company.address_cep,
  ]
    .map((part) => pdfText(part))
    .filter(Boolean);
  if (parts.length > 0) return parts.join(", ");
  return pdfText(company.address);
}

function statusLabel(status: string): string {
  switch (status) {
    case "CONFORME":
      return "Aprovado";
    case "NAO_CONFORME":
      return "Apontamento";
    case "NA":
      return "N/A";
    case "PENDENTE":
      return "Pendente";
    default:
      return pdfText(status) || "-";
  }
}

class OfficialPdfWriter {
  private readonly doc: PDFDocument;
  private page: PDFPage;
  private y: number;
  private pageNumber = 1;

  constructor(
    doc: PDFDocument,
    private readonly font: PDFFont,
    private readonly fontBold: PDFFont,
  ) {
    this.doc = doc;
    this.page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    this.y = PAGE_HEIGHT - MARGIN;
  }

  private ensure(space: number) {
    if (this.y - space < MARGIN + 28) {
      this.footer();
      this.page = this.doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      this.pageNumber += 1;
      this.y = PAGE_HEIGHT - MARGIN;
    }
  }

  footer() {
    this.page.drawText("Laudo oficial emitido pelo servidor Torres Vistoria", {
      x: MARGIN,
      y: 22,
      size: 8,
      font: this.font,
      color: MUTED,
    });
    this.page.drawText(`Pagina ${this.pageNumber}`, {
      x: PAGE_WIDTH - MARGIN - 60,
      y: 22,
      size: 8,
      font: this.font,
      color: MUTED,
    });
  }

  heading(title: string) {
    this.ensure(36);
    this.page.drawRectangle({
      x: MARGIN,
      y: this.y - 18,
      width: 4,
      height: 18,
      color: ORANGE,
    });
    this.page.drawText(pdfText(title), {
      x: MARGIN + 12,
      y: this.y - 14,
      size: 12,
      font: this.fontBold,
      color: NAVY,
    });
    this.y -= 28;
  }

  kv(label: string, value: unknown) {
    const text = pdfText(value) || "-";
    const lines = this.wrap(`${label}: ${text}`, 86);
    this.ensure(14 * lines.length);
    for (const line of lines) {
      this.page.drawText(line, {
        x: MARGIN,
        y: this.y,
        size: 9,
        font: this.font,
        color: BLACK,
      });
      this.y -= 13;
    }
  }

  paragraph(value: unknown) {
    const text = pdfText(value) || "-";
    const lines = this.wrap(text, 96);
    this.ensure(12 * lines.length + 4);
    for (const line of lines) {
      this.page.drawText(line, {
        x: MARGIN,
        y: this.y,
        size: 9,
        font: this.font,
        color: BLACK,
      });
      this.y -= 12;
    }
    this.y -= 4;
  }

  wrap(text: string, maxChars: number): string[] {
    const words = text.split(/\s+/).filter(Boolean);
    if (words.length === 0) return ["-"];
    const lines: string[] = [];
    let current = "";
    for (const word of words) {
      const next = current ? `${current} ${word}` : word;
      if (next.length > maxChars && current) {
        lines.push(current);
        current = word;
      } else {
        current = next;
      }
    }
    if (current) lines.push(current);
    return lines;
  }

  titleBlock(input: OfficialLaudoInput) {
    this.page.drawRectangle({
      x: 0,
      y: PAGE_HEIGHT - 72,
      width: PAGE_WIDTH,
      height: 72,
      color: NAVY,
    });
    this.page.drawRectangle({
      x: 0,
      y: PAGE_HEIGHT - 76,
      width: PAGE_WIDTH,
      height: 4,
      color: ORANGE,
    });
    this.page.drawText("TORRES VISTORIA", {
      x: MARGIN,
      y: PAGE_HEIGHT - 32,
      size: 11,
      font: this.fontBold,
      color: rgb(1, 1, 1),
    });
    this.page.drawText("LAUDO TECNICO OFICIAL DE VISTORIA VEICULAR", {
      x: MARGIN,
      y: PAGE_HEIGHT - 50,
      size: 13,
      font: this.fontBold,
      color: rgb(1, 1, 1),
    });
    this.page.drawText(`N. ${input.inspection.inspection_number}`, {
      x: PAGE_WIDTH - MARGIN - 90,
      y: PAGE_HEIGHT - 40,
      size: 10,
      font: this.fontBold,
      color: rgb(1, 1, 1),
    });
    this.y = PAGE_HEIGHT - 96;
  }
}

export async function buildOfficialLaudoPdf(input: OfficialLaudoInput): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const writer = new OfficialPdfWriter(doc, font, fontBold);

  writer.titleBlock(input);

  const companyName =
    pdfText(input.company?.trade_name) || pdfText(input.company?.legal_name) || "Torres Vistoria";

  writer.heading("Empresa emitente");
  writer.kv("Razao / nome", companyName);
  writer.kv("CNPJ", input.company?.document);
  writer.kv("Endereco", companyAddress(input.company));
  writer.kv("Contato", [input.company?.phone, input.company?.email].filter(Boolean).join(" | "));
  writer.kv("Vistoriador", input.inspectorName);
  writer.kv("Data da vistoria", `${input.inspection.inspection_date} ${input.inspection.inspection_time ?? ""}`);
  writer.kv("Local", input.inspection.location);
  writer.kv("Finalidade", input.inspection.inspection_purpose);

  writer.heading("Contratante");
  writer.kv("Cliente", input.inspection.client_name);
  writer.kv("Documento", input.inspection.client_document);
  writer.kv("Telefone", input.inspection.client_phone);
  writer.kv("E-mail", input.inspection.client_email);
  writer.kv("Solicitante", input.inspection.requester_name);
  writer.kv("Documento do solicitante", input.inspection.requester_document);

  writer.heading("Veiculo");
  writer.kv("Placa", input.inspection.plate);
  writer.kv("Chassi", input.inspection.chassis);
  writer.kv("Renavam", input.inspection.renavam);
  writer.kv("Marca / modelo", `${input.inspection.brand ?? ""} ${input.inspection.model ?? ""} ${input.inspection.version ?? ""}`);
  writer.kv("Cor / combustivel", `${input.inspection.color ?? "-"} / ${input.inspection.fuel ?? "-"}`);
  writer.kv("Ano fab. / modelo", `${input.inspection.manufacture_year ?? "-"} / ${input.inspection.model_year ?? "-"}`);
  writer.kv("Km", input.inspection.mileage);

  writer.heading("Checklist tecnico");
  if (input.checklist.length === 0) {
    writer.paragraph("Nenhum item de checklist registrado no banco.");
  } else {
    const grouped = new Map<string, OfficialChecklistItem[]>();
    for (const item of input.checklist) {
      const key = pdfText(item.category) || "Geral";
      const list = grouped.get(key) ?? [];
      list.push(item);
      grouped.set(key, list);
    }
    for (const [category, items] of grouped) {
      writer.paragraph(category);
      for (const item of items) {
        const note = item.notes ? ` - ${pdfText(item.notes)}` : "";
        writer.kv(`  ${item.item_name}`, `${statusLabel(item.status)}${note}`);
      }
    }
  }

  writer.heading("Fotografias registradas no banco");
  writer.paragraph(
    "O laudo oficial lista as fotos autorizadas. As imagens em si permanecem no bucket privado; nao sao reenviadas pelo cliente.",
  );
  if (input.photos.length === 0) {
    writer.paragraph("Nenhuma fotografia registrada.");
  } else {
    for (const photo of input.photos) {
      writer.kv(photo.category, photo.storage_path);
    }
  }

  writer.heading("Parecer tecnico");
  writer.paragraph(input.inspection.opinion);
  if (input.inspection.technical_notes) {
    writer.heading("Notas tecnicas");
    writer.paragraph(input.inspection.technical_notes);
  }

  writer.heading("Autenticidade");
  writer.kv("Codigo de verificacao", input.verificationCode);
  writer.kv("Integridade", "SHA-256 do arquivo registrado no servidor");
  writer.kv("Validacao publica", input.validationUrl);
  writer.kv("Emitido em", input.issuedAt);
  writer.paragraph(
    "Este PDF foi gerado exclusivamente no servidor a partir dos dados persistidos. Um PDF gerado no navegador nao e documento oficial.",
  );

  writer.footer();
  return doc.save();
}
