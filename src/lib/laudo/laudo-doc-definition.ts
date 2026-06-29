import { PHOTO_CATALOG, PAINT_PHOTO_CATEGORY_KEYS } from "@/lib/photos/photo-catalog";
import {
  buildPhotoPairs,
  groupPhotosBySection,
} from "@/lib/photos/pdf-photo-layout";
import { formatDate, formatDocument, formatPhone, formatPlate } from "@/lib/formatters";
import { getChecklistCategoryLabel } from "@/lib/checklist-catalog";
import { getChecklistStatusLabel, getChecklistStatusPdfColor } from "@/lib/checklist-status";
import {
  buildInspectionInfoRows,
  buildSaleMarketInfoRows,
  buildVehicleInfoRows,
  hasLaudoValue,
  hasSaleMarketSectionData,
} from "@/lib/laudo/laudo-field-utils";
import {
  HEADER_OPINION_HEIGHT,
  HEADER_QR_SIZE,
  buildPlateAndValidationGroup,
  headerValidationWidth,
} from "@/lib/laudo/mercosul-plate-pdf";
import {
  getLaudoLegalFooter,
  getOpinionLabel,
  getPrimaryColor,
  summarizeLaudoChecklist,
  type LaudoPayload,
} from "@/lib/laudo/laudo-model";

type PdfNode = Record<string, unknown>;

const EMPTY_VALUE = "Não informado";
const NAVY = "#020f2f";
const SLATE = "#64748b";
const BORDER = "#e2e8f0";
const SURFACE = "#f8fafc";
const PAGE_CONTENT_WIDTH = 523;
const HEADER_BRAND_LOGO_WIDTH = 160;
const HEADER_BRAND_LOGO_HEIGHT = 63;
const HEADER_BRAND_COLUMN_WIDTH = 168;
const HEADER_ROW_TOP = 2;

function value(v: string | number | null | undefined): string {
  if (v === null || v === undefined || v === "") return EMPTY_VALUE;
  return String(v);
}

function inspectionDataSection(
  title: string,
  rows: [string, string][],
): PdfNode[] {
  const grid = infoGrid(rows);
  if (!grid) return [];
  return [premiumHeader(title), grid];
}

function sectionTitle(text: string, color: string): PdfNode {
  return {
    text,
    color: "#ffffff",
    fillColor: color,
    bold: true,
    fontSize: 10,
    alignment: "center",
    margin: [0, 10, 0, 6],
  };
}

function premiumHeader(text: string): PdfNode {
  return {
    table: {
      widths: ["*"],
      body: [[{ text, color: "#ffffff", fillColor: NAVY, bold: true, fontSize: 9, alignment: "center", characterSpacing: 0.6, margin: [0, 6, 0, 6] }]],
    },
    layout: "noBorders",
    margin: [0, 8, 0, 0],
  };
}

function fieldNode(label: string, content: string): PdfNode {
  return {
    stack: [
      { text: label, fontSize: 7, color: "#64748b" },
      { text: content || EMPTY_VALUE, fontSize: 9, bold: true, margin: [0, 1, 0, 0] },
    ],
    margin: [0, 0, 0, 7],
  };
}

function infoGrid(rows: [string, string][], columnsCount = 3): PdfNode | null {
  if (rows.length === 0) return null;

  const body: PdfNode[][] = [];
  for (let index = 0; index < rows.length; index += columnsCount) {
    const slice = rows.slice(index, index + columnsCount);
    body.push([
      ...slice.map(([label, content]) => fieldNode(label, content)),
      ...Array.from({ length: columnsCount - slice.length }, () => ({ text: "" })),
    ]);
  }

  return {
    table: {
      widths: Array.from({ length: columnsCount }, () => "*"),
      body,
    },
    layout: "noBorders",
    margin: [0, 2, 0, 8],
  };
}

function buildBrandLogoCell(brand: string, brandLogoDataUrl?: string): PdfNode {
  const caption = { text: "Marca do veículo", alignment: "center", fontSize: 7, color: "#64748b" };

  const innerStack = brandLogoDataUrl
    ? {
        stack: [
          {
            image: brandLogoDataUrl,
            width: 72,
            height: 36,
            alignment: "center",
            margin: [0, 10, 0, 4],
          },
          caption,
        ],
      }
    : {
        stack: [
          {
            text: brand || "Marca",
            alignment: "center",
            bold: true,
            color: "#0f172a",
            fontSize: 14,
            margin: [0, 16, 0, 2],
          },
          caption,
        ],
      };

  return {
    table: {
      widths: ["*"],
      body: [[{ ...innerStack, fillColor: "#f8fafc", margin: [6, 6, 6, 6] }]],
    },
    layout: {
      hLineColor: () => "#0f172a",
      vLineColor: () => "#0f172a",
      hLineWidth: () => 0.8,
      vLineWidth: () => 0.8,
      paddingLeft: () => 0,
      paddingRight: () => 0,
      paddingTop: () => 0,
      paddingBottom: () => 0,
    },
  };
}

function statCardCell(label: string, valueText: string, accent: string): PdfNode {
  return {
    stack: [
      { text: label.toUpperCase(), fontSize: 7, color: SLATE, bold: true, characterSpacing: 0.4 },
      { text: valueText, fontSize: 15, bold: true, color: accent, margin: [0, 4, 0, 0] },
    ],
    fillColor: SURFACE,
  };
}

function buildStatsDashboard(
  stats: ReturnType<typeof summarizeLaudoChecklist>,
  photoCount: number,
  primaryColor: string,
): PdfNode {
  const riskColor =
    stats.riskLevel === "ALTO" ? "#dc2626" : stats.riskLevel === "MEDIO" ? "#f97316" : "#16a34a";

  return {
    table: {
      widths: ["*", "*", "*", "*"],
      body: [
        [
          statCardCell("Checklist", `${stats.evaluated}/${stats.total}`, primaryColor),
          statCardCell("Com ressalvas", String(stats.naoConforme), "#d97706"),
          statCardCell("Fotos", String(photoCount), "#2563eb"),
          statCardCell("Risco", stats.riskLevel, riskColor),
        ],
      ],
    },
    layout: {
      hLineColor: () => "#d1d5db",
      vLineColor: () => "#d1d5db",
      hLineWidth: (rowIndex: number, node: { table: { body: unknown[] } }) =>
        rowIndex === 0 || rowIndex === node.table.body.length ? 0.6 : 0.25,
      vLineWidth: (columnIndex: number, node: { table: { widths: unknown[] } }) =>
        columnIndex === 0 || columnIndex === node.table.widths.length ? 0.6 : 0.25,
      paddingLeft: () => 8,
      paddingRight: () => 8,
      paddingTop: () => 8,
      paddingBottom: () => 8,
    },
    margin: [0, 0, 0, 10],
  };
}

function opinionAccent(opinion: string): string {
  if (opinion.includes("REPROVADO")) return "#dc2626";
  if (opinion.includes("APONTAMENTO")) return "#f97316";
  return "#16a34a";
}

function horizontalRule(margin: [number, number, number, number] = [0, 0, 0, 10]): PdfNode {
  return {
    canvas: [{ type: "line", x1: 0, y1: 0, x2: PAGE_CONTENT_WIDTH, y2: 0, lineWidth: 0.5, lineColor: BORDER }],
    margin,
  };
}

function buildOpinionBadge(opinion: string, accent: string, columnWidth: number): PdfNode {
  const isLongLabel = opinion.length > 14;

  return {
    table: {
      widths: [columnWidth],
      heights: [HEADER_OPINION_HEIGHT],
      body: [[{
        text: opinion,
        bold: true,
        color: "#ffffff",
        fillColor: accent,
        alignment: "center",
        verticalAlignment: "middle",
        fontSize: isLongLabel ? 7 : 9.5,
        characterSpacing: 0.5,
        margin: [6, 0, 6, 0],
      }]],
    },
    layout: "noBorders",
  };
}

function buildValidationColumn(
  opinion: string,
  accent: string,
  validationUrl: string,
  verificationCode: string,
  columnWidth: number,
): PdfNode {
  const qrSize = Math.min(columnWidth, HEADER_QR_SIZE);

  return {
    stack: [
      buildOpinionBadge(opinion, accent, columnWidth),
      { qr: validationUrl || verificationCode, fit: qrSize, alignment: "right", margin: [0, 4, 0, 0] },
      {
        text: verificationCode,
        style: "small",
        alignment: "right",
        margin: [0, 2, 0, 0],
        characterSpacing: 0.3,
      },
    ],
    width: columnWidth,
  };
}

function buildBrandIdentityColumn(
  payload: LaudoPayload,
  company: LaudoPayload["company"],
  primaryColor: string,
): PdfNode {
  return {
    stack: [
      payload.logoDataUrl
        ? {
            image: payload.logoDataUrl,
            width: HEADER_BRAND_LOGO_WIDTH,
            height: HEADER_BRAND_LOGO_HEIGHT,
            margin: [0, 0, 0, 0],
          }
        : {
            text: "TORRES VISTORIAS",
            style: "brand",
            color: primaryColor,
            margin: [0, 0, 0, 0],
          },
      {
        text: "Laudo cautelar veicular",
        style: "docType",
        margin: [0, 10, 0, 0],
        lineHeight: 1.2,
      },
      {
        text: `Nº ${payload.verificationCode}`,
        fontSize: 14,
        bold: true,
        color: NAVY,
        margin: [0, 5, 0, 0],
        lineHeight: 1.15,
      },
      ...(company?.name
        ? [{
            text: company.name,
            style: "small",
            margin: [0, 4, 0, 0] as [number, number, number, number],
            lineHeight: 1.15,
          }]
        : []),
    ],
    width: HEADER_BRAND_COLUMN_WIDTH,
  };
}

function buildCoverHeader(
  payload: LaudoPayload,
  inspection: LaudoPayload["inspection"],
  company: LaudoPayload["company"],
  primaryColor: string,
  opinion: string,
  validationUrl: string,
): PdfNode[] {
  const accent = opinionAccent(opinion);
  const validationWidth = headerValidationWidth(formatPlate(inspection.plate));

  return [
    {
      canvas: [{ type: "rect", x: 0, y: 0, w: PAGE_CONTENT_WIDTH, h: 3, color: NAVY }],
      margin: [0, 0, 0, 4],
    },
    {
      columns: [
        buildBrandIdentityColumn(payload, company, primaryColor),
        { text: "", width: "*" },
        buildPlateAndValidationGroup(
          inspection.plate,
          inspection,
          buildValidationColumn(opinion, accent, validationUrl, payload.verificationCode, validationWidth),
          HEADER_ROW_TOP,
        ),
      ],
      columnGap: 8,
    },
    horizontalRule([0, 4, 0, 6]),
  ];
}

function checklistStatusNode(status: string): PdfNode {
  const label = getChecklistStatusLabel(status);
  const color = getChecklistStatusPdfColor(status);

  return {
    text: label,
    fontSize: 8,
    bold: true,
    color,
  };
}

function checklistBarChart(payload: LaudoPayload): PdfNode {
  const stats = summarizeLaudoChecklist(payload.checklist);
  const total = Math.max(stats.total, 1);
  const width = PAGE_CONTENT_WIDTH;
  const segments = [
    { label: getChecklistStatusLabel("CONFORME"), value: stats.conforme, color: "#16a34a" },
    { label: getChecklistStatusLabel("NAO_CONFORME"), value: stats.naoConforme, color: "#d97706" },
    { label: getChecklistStatusLabel("NA"), value: stats.naoAplicavel, color: SLATE },
    { label: getChecklistStatusLabel("PENDENTE"), value: stats.pendente, color: "#f59e0b" },
  ];

  const activeSegments = segments.filter((segment) => segment.value > 0);
  let x = 0;
  const rects = activeSegments.map((segment, index) => {
    const isLast = index === activeSegments.length - 1;
    const rectWidth = isLast
      ? width - x
      : Math.max(Math.round((segment.value / total) * width), 1);
    const node = { type: "rect", x, y: 0, w: rectWidth, h: 10, color: segment.color };
    x += rectWidth;
    return node;
  });

  if (rects.length === 0) {
    rects.push({ type: "rect", x: 0, y: 0, w: width, h: 10, color: BORDER });
  }

  return {
    stack: [
      { text: "Resumo do checklist", fontSize: 7, color: SLATE, bold: true, characterSpacing: 0.4, margin: [0, 0, 0, 6] },
      { canvas: rects, margin: [0, 0, 0, 0] },
      {
        table: {
          widths: ["*", "*", "*", "*"],
          body: [
            segments.map((segment) => ({
              text: `${segment.label}: ${segment.value}`,
              fontSize: 7.5,
              color: segment.color,
              bold: true,
              margin: [0, 6, 0, 0],
            })),
          ],
        },
        layout: "noBorders",
      },
    ],
    margin: [0, 0, 0, 10],
  };
}

function buildChecklistSection(payload: LaudoPayload): PdfNode[] {
  const grouped = payload.checklist.reduce<Record<string, typeof payload.checklist>>((acc, item) => {
    (acc[item.category] ??= []).push(item);
    return acc;
  }, {});

  return Object.entries(grouped).flatMap(([category, items]) => {
    const rows = items.map((item) => [
      { text: item.item_name, fontSize: 8 },
      checklistStatusNode(item.status),
      {
        text: item.notes || "Sem observação",
        fontSize: 8,
        color: item.status === "NAO_CONFORME" ? "#92400e" : "#0f172a",
        bold: item.status === "NAO_CONFORME",
      },
    ]);

    return [
      premiumHeader(getChecklistCategoryLabel(category).toUpperCase()),
      {
        table: {
          headerRows: 1,
          widths: ["40%", "20%", "40%"],
          body: [
            [
              { text: "Item avaliado", style: "tableHeader" },
              { text: "Status", style: "tableHeader" },
              { text: "Observação técnica", style: "tableHeader" },
            ],
            ...rows,
          ],
        },
        layout: {
          hLineColor: () => "#cbd5e1",
          vLineColor: () => "#e2e8f0",
          hLineWidth: (i: number) => (i === 0 || i === 1 ? 0.8 : 0.4),
          vLineWidth: () => 0.2,
          paddingLeft: () => 5,
          paddingRight: () => 5,
          paddingTop: () => 4,
          paddingBottom: () => 4,
        },
        margin: [0, 0, 0, 8],
      },
    ];
  });
}

function buildPhotoSection(payload: LaudoPayload, color: string): PdfNode[] {
  const photos = payload.photos;
  if (photos.length === 0) {
    return [
      sectionTitle("Registro fotográfico", color),
      { text: "Nenhuma foto registrada para esta vistoria.", color: "#64748b", margin: [0, 0, 0, 8] },
    ];
  }

  const grouped = groupPhotosBySection(photos);
  const nodes: PdfNode[] = [premiumHeader("REGISTRO FOTOGRÁFICO")];

  for (const section of PHOTO_CATALOG) {
    const sectionPhotos = grouped.get(section.key);
    if (!sectionPhotos?.length) continue;

    nodes.push(
      {
        text: section.name.toUpperCase(),
        bold: true,
        fontSize: 9,
        color: "#0f172a",
        margin: [0, 10, 0, 2],
      },
      {
        text: section.description,
        fontSize: 7,
        color: "#64748b",
        margin: [0, 0, 0, 6],
      },
    );

    const labels = sectionPhotos.map((photo, index) => {
      if (photo.damage_location) {
        return `${index + 1}. ${photo.display_name ?? "Avaria"} — ${photo.damage_location} (${photo.damage_severity ?? "—"})`;
      }
      if (photo.complementary_name) {
        return `${index + 1}. ${photo.complementary_name}`;
      }
      return undefined;
    });

    nodes.push(...buildPhotoPairs(sectionPhotos, labels));
  }

  return nodes;
}

function buildSaleMarketSection(inspection: LaudoPayload["inspection"]): PdfNode[] {
  if (!hasSaleMarketSectionData(inspection)) return [];

  const rows = buildSaleMarketInfoRows(inspection);
  if (rows.length === 0) return [];

  const grid = infoGrid(rows);
  if (!grid) return [];

  return [premiumHeader("VENDA, JUSTIÇA E MERCADO"), grid];
}

function buildTechnicalOpinionSection(inspection: LaudoPayload["inspection"]): PdfNode[] {
  const notes = inspection.technical_notes?.trim();
  if (!hasLaudoValue(notes)) return [];

  return [
    premiumHeader("PARECER TÉCNICO"),
    {
      text: notes,
      fontSize: 10,
      bold: true,
      margin: [0, 6, 0, 8],
    },
  ];
}

export function buildLaudoDocDefinition(payload: LaudoPayload): Record<string, unknown> {
  const color = getPrimaryColor(payload.settings);
  const stats = summarizeLaudoChecklist(payload.checklist);
  const inspection = payload.inspection;
  const company = payload.company;
  const opinion = getOpinionLabel(inspection.opinion);
  const validationUrl = payload.validationUrl ?? "";
  const paintCategorySet = new Set<string>([...PAINT_PHOTO_CATEGORY_KEYS, "PINTURA_CAPO", "PINTURA_TETO"]);
  const featuredPhotos = payload.photos
    .filter(
      (photo) =>
        photo.section_key === "IDENTIFICACAO_EXTERNA" ||
        (!paintCategorySet.has(photo.category) &&
          !photo.category.startsWith("PINT_") &&
          !photo.category.startsWith("PINTURA_") &&
          photo.category !== "DOCUMENTOS" &&
          photo.category !== "EXTRAS" &&
          photo.category !== "COMPLEMENTAR" &&
          photo.category !== "AVARIA" &&
          !photo.category.startsWith("DOC_")),
    )
    .slice(0, 2);

  const content: PdfNode[] = [
    ...buildCoverHeader(payload, inspection, company, color, opinion, validationUrl),
    buildStatsDashboard(stats, payload.photos.length, color),
    checklistBarChart(payload),
    ...inspectionDataSection(
      "DADOS DA VISTORIA",
      buildInspectionInfoRows(
        inspection,
        company,
        formatDate,
        formatPhone,
        formatDocument,
      ),
    ),
    premiumHeader("DADOS DO VEÍCULO"),
    {
      table: {
        widths: [95, "*"],
        body: [
          [
            buildBrandLogoCell(inspection.brand, payload.brandLogoDataUrl),
            infoGrid(buildVehicleInfoRows(inspection)) ?? { text: "" },
          ],
        ],
      },
      layout: "noBorders",
      margin: [0, 3, 0, 2],
    },
    ...(featuredPhotos.length ? buildPhotoPairs(featuredPhotos) : []),
    ...buildSaleMarketSection(inspection),
    premiumHeader("CHECKLIST TÉCNICO"),
    ...buildChecklistSection(payload),
    ...buildPhotoSection(payload, color),
    ...buildTechnicalOpinionSection(inspection),
    premiumHeader("INFORMATIVO JURÍDICO"),
    { text: getLaudoLegalFooter(payload.settings), fontSize: 8, alignment: "justify", margin: [0, 6, 0, 12] },
    {
      columns: [
        {
          stack: [
            { text: "Empresa responsável", style: "muted" },
            { text: value(company?.name?.trim() || "Torres Vistorias"), bold: true, margin: [0, 18, 0, 0] },
            ...(company?.document
              ? [{ text: formatDocument(company.document), style: "small" as const }]
              : []),
          ],
        },
        {
          stack: [
            { text: "Validação pública", style: "muted", alignment: "right" },
            { text: validationUrl || "Disponível pelo código do laudo", style: "small", alignment: "right" },
            { text: `Hash: ${payload.integrityHash.slice(0, 32)}...`, style: "small", alignment: "right" },
          ],
        },
      ],
      margin: [0, 10, 0, 0],
    },
  ];

  return {
    pageSize: "A4",
    pageMargins: [36, 44, 36, 44],
    content,
    footer: (currentPage: number, pageCount: number) => ({
      stack: [
        {
          canvas: [{ type: "line", x1: 36, y1: 0, x2: 559, y2: 0, lineWidth: 0.5, lineColor: BORDER }],
        },
        {
          columns: [
            {
              text: `${company?.name?.trim() || "Torres Vistorias"} · Laudo cautelar veicular · ${payload.verificationCode}`,
              style: "small",
              margin: [36, 6, 0, 0],
            },
            {
              text: `Página ${currentPage} de ${pageCount}`,
              style: "small",
              alignment: "right",
              margin: [0, 6, 36, 0],
            },
          ],
        },
      ],
    }),
    styles: {
      brand: { fontSize: 18, bold: true },
      docType: { fontSize: 9, color: SLATE, characterSpacing: 0.2 },
      muted: { fontSize: 9, color: SLATE },
      small: { fontSize: 7, color: SLATE },
      tableHeader: { fontSize: 8, bold: true, fillColor: SURFACE, color: NAVY },
      tableLabel: { fontSize: 8, color: "#475569", bold: true },
      tableValue: { fontSize: 9 },
    },
    defaultStyle: { fontSize: 9, color: "#0f172a" },
  };
}

