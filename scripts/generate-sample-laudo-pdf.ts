/**
 * Gera um PDF de amostra do laudo redesenhado (Node) para revisão visual.
 * Uso: npx tsx scripts/generate-sample-laudo-pdf.ts
 */
import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import PdfPrinter from "pdfmake";
import { ChecklistStatus, InspectionOpinion } from "../src/modules/torres-vistoria/domain/enums";
import { CHECKLIST_CATALOG } from "../src/modules/torres-vistoria/domain/checklist/checklist-catalog";
import { formatChecklistIssueNotes } from "../src/modules/torres-vistoria/domain/checklist/checklist-issue-options";
import type { ChecklistItem } from "../src/modules/torres-vistoria/services/checklist-service";
import type { LaudoPayload, LaudoPhoto } from "../src/modules/torres-vistoria/domain/laudo/laudo-model";
import { buildLaudoDocDefinition } from "../src/modules/torres-vistoria/domain/laudo/laudo-doc-definition";
import { PDF_TABLE_LAYOUTS } from "../src/modules/torres-vistoria/domain/laudo/pdf/pdf-table-layouts";
import {
  LAUDO_SECTION_ICON_PATHS,
  type LaudoSectionIconDataUrls,
} from "../src/modules/torres-vistoria/domain/laudo/pdf/section-icons";
import type { PdfIconName } from "../src/modules/torres-vistoria/domain/laudo/pdf/pdf-icons";

function loadSectionIconDataUrls(): LaudoSectionIconDataUrls {
  const icons: LaudoSectionIconDataUrls = {};
  for (const [key, publicPath] of Object.entries(LAUDO_SECTION_ICON_PATHS) as Array<
    [PdfIconName, string]
  >) {
    const filePath = join(process.cwd(), "public", publicPath.replace(/^\//, ""));
    try {
      const buf = readFileSync(filePath);
      icons[key] = `data:image/png;base64,${buf.toString("base64")}`;
    } catch {
      // Sem asset: PDF cai no outline.
    }
  }
  return icons;
}

function makeInspection(overrides: Record<string, unknown> = {}): LaudoPayload["inspection"] {
  return {
    id: "insp-sample",
    tenant_id: "tenant-1",
    inspector_id: "inspetor-1",
    inspection_number: 148,
    inspection_date: "2026-08-13",
    inspection_time: "15:09:00",
    location: "Belo Horizonte / MG",
    inspection_purpose: "Transferência",
    client_name: "Cliente Demonstração",
    client_document: "12345678901",
    plate: "ABC1D23",
    chassis: "9BD358A4LPC123456",
    renavam: "12345678901",
    brand: "FIAT",
    model: "ARGO 1.0",
    color: "BRANCO",
    fuel: "FLEX",
    manufacture_year: 2019,
    model_year: 2020,
    mileage: 45200,
    version: "Drive",
    motor_number: "310A20123456789",
    vehicle_uf: "MG",
    vehicle_origin: "Brasil",
    opinion: InspectionOpinion.APROVADO_COM_APONTAMENTOS,
    technical_notes:
      "Veículo apresenta bom estado geral de conservação. Identificados apontamentos pontuais na estrutura e pintura, sem comprometimento estrutural relevante para a finalidade da vistoria. Recomenda-se atenção aos itens listados na seção de apontamentos.",
    ...overrides,
  } as LaudoPayload["inspection"];
}

function makeItem(overrides: Partial<ChecklistItem> = {}): ChecklistItem {
  return {
    id: "item-1",
    inspection_id: "insp-sample",
    tenant_id: "tenant-1",
    category: "ESTRUTURA",
    item_name: "Longarina dianteira",
    status: ChecklistStatus.CONFORME,
    notes: null,
    ...overrides,
  };
}

function catalogChecklist(): ChecklistItem[] {
  return CHECKLIST_CATALOG.flatMap((category) =>
    category.items.map((item, index) => {
      const isIssue = item.name === "Painel dianteiro" || item.name === "Capô";
      return makeItem({
        id: `${category.key}-${index}`,
        category: category.key,
        item_name: item.name,
        status: isIssue ? ChecklistStatus.NAO_CONFORME : ChecklistStatus.CONFORME,
        notes: isIssue
          ? formatChecklistIssueNotes(category.key, item.name, ["reparado"])
          : null,
      });
    }),
  );
}

function makePhoto(id: string, category: string, display_name: string): LaudoPhoto {
  // JPEG 1x1 mínimo para não inflar o PDF de revisão.
  const pixel =
    "/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAGfAP/EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAQUCf//EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQMBAT8Bf//EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQIBAT8Bf//Z";
  return {
    id,
    inspection_id: "insp-sample",
    tenant_id: "tenant-1",
    category,
    display_name,
    public_url: `https://example.com/${id}.jpg`,
    dataUrl: `data:image/jpeg;base64,${pixel}`,
    captured_at: "2026-08-13T15:09:00.000Z",
  } as LaudoPhoto;
}

const photos = [
  makePhoto("1", "EXT_FRENTE_45_ESQ", "Frente 45° esquerda"),
  makePhoto("2", "EXT_FRENTE_45_DIR", "Frente 45° direita"),
  makePhoto("3", "EXT_LATERAL_ESQ", "Lateral esquerda"),
  makePhoto("4", "EXT_LATERAL_DIR", "Lateral direita"),
  makePhoto("5", "EXT_TRASEIRA", "Traseira"),
  makePhoto("6", "MOT_COMPARTIMENTO", "Compartimento do motor"),
  makePhoto("7", "INT_PAINEL", "Painel interno"),
  makePhoto("8", "IDV_NUMERO_CHASSI", "Número do chassi"),
  makePhoto("9", "PINT_CAPO", "Capô"),
].map((photo, index) =>
  index === 8
    ? ({ ...photo, damage_location: "Capô", damage_severity: "Leve" } as LaudoPhoto)
    : photo,
);

const payload: LaudoPayload = {
  inspection: makeInspection(),
  checklist: catalogChecklist(),
  photos,
  company: {
    name: "Torres Vistoria",
    document: "12345678000199",
    phone: "3133334444",
    address: "Belo Horizonte / MG",
    primary_color: "#ea580c",
  },
  inspector: {
    full_name: "Vistoriador Demonstração",
    credential: "CREA-MG 123456",
  },
  laudoNumber: "TV-2026-000148",
  verificationCode: "TV-K7M2-9XQH-4NWP",
  integrityHash: "a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456",
  validationUrl: "https://app.torres.app/validar/TV-K7M2-9XQH-4NWP",
  sectionIconDataUrls: loadSectionIconDataUrls(),
  generatedAt: new Date("2026-08-13T15:09:00"),
};

async function main() {
  const fonts = {
    Roboto: {
      normal: "Helvetica",
      bold: "Helvetica-Bold",
      italics: "Helvetica-Oblique",
      bolditalics: "Helvetica-BoldOblique",
    },
  };

  const printer = new PdfPrinter(fonts);
  const docDefinition = buildLaudoDocDefinition(payload) as Record<string, unknown>;
  // pdfmake node usa funções de layout; strip header/footer functions are fine.
  const pdfDoc = printer.createPdfKitDocument(docDefinition as never, {
    tableLayouts: PDF_TABLE_LAYOUTS as never,
  });

  const chunks: Buffer[] = [];
  pdfDoc.on("data", (chunk: Buffer) => chunks.push(chunk));
  await new Promise<void>((resolve, reject) => {
    pdfDoc.on("end", () => resolve());
    pdfDoc.on("error", reject);
    pdfDoc.end();
  });

  const outDir = join(process.cwd(), ".tmp-ref-pages");
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "torres-laudo-redesign-sample.pdf");
  const buffer = Buffer.concat(chunks);
  writeFileSync(outPath, buffer);
  console.log(`Wrote ${outPath} (${buffer.length} bytes)`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
