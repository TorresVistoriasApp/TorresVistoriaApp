import { PHOTO_CATEGORY_LABELS } from "@/components/photos/photo-categories";
import { PAINT_PHOTO_CATEGORIES } from "@/lib/constants";
import { getChecklistCategoryLabel, getChecklistStatusLabel } from "@/lib/checklist-catalog";
import { PAINT_PARTS } from "@/lib/paint-catalog";
import { formatDate, formatDocument, formatPhone } from "@/lib/formatters";
import {
  buildInspectionInfoRows,
  buildSaleMarketInfoRows,
  buildVehicleInfoRows,
  hasLaudoValue,
  hasSaleMarketSectionData,
} from "@/lib/laudo/laudo-field-utils";
import {
  getLaudoLegalFooter,
  getOpinionLabel,
  getPrimaryColor,
  summarizeLaudoChecklist,
  type LaudoPayload,
  type LaudoPhoto,
} from "@/lib/laudo/laudo-model";

type PdfNode = Record<string, unknown>;

const EMPTY_VALUE = "Não informado";
const NAVY = "#020f2f";
const SLATE = "#64748b";
const BORDER = "#e2e8f0";
const SURFACE = "#f8fafc";
const PAGE_CONTENT_WIDTH = 523;

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
    margin: [0, 10, 0, 0],
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

  if (brandLogoDataUrl) {
    return {
      stack: [
        {
          image: brandLogoDataUrl,
          width: 72,
          fit: [72, 36],
          alignment: "center",
          margin: [0, 10, 0, 4],
        },
        caption,
      ],
      fillColor: "#f8fafc",
    };
  }

  return {
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
    fillColor: "#f8fafc",
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
          statCardCell("Não conforme", String(stats.naoConforme), "#dc2626"),
          statCardCell("Fotos", String(photoCount), "#2563eb"),
          statCardCell("Risco", stats.riskLevel, riskColor),
        ],
      ],
    },
    layout: {
      hLineColor: () => BORDER,
      vLineColor: () => BORDER,
      hLineWidth: () => 0.5,
      vLineWidth: () => 0.5,
      paddingLeft: () => 10,
      paddingRight: () => 10,
      paddingTop: () => 10,
      paddingBottom: () => 10,
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

function buildCoverHeader(
  payload: LaudoPayload,
  inspection: LaudoPayload["inspection"],
  company: LaudoPayload["company"],
  primaryColor: string,
  opinion: string,
  validationUrl: string,
): PdfNode[] {
  const accent = opinionAccent(opinion);

  return [
    {
      canvas: [{ type: "rect", x: 0, y: 0, w: PAGE_CONTENT_WIDTH, h: 3, color: NAVY }],
      margin: [0, 0, 0, 10],
    },
    {
      columns: [
        {
          stack: [
            payload.logoDataUrl
              ? { image: payload.logoDataUrl, width: 132, fit: [132, 52], margin: [0, 0, 0, 6] }
              : { text: "TORRES VISTORIAS", style: "brand", color: primaryColor, margin: [0, 0, 0, 6] },
            { text: "Laudo cautelar veicular", style: "docType" },
            {
              text: `Nº ${inspection.inspection_number}`,
              fontSize: 14,
              bold: true,
              color: NAVY,
              margin: [0, 4, 0, 0],
            },
            ...(company?.name
              ? [{ text: company.name, style: "small", margin: [0, 2, 0, 0] as [number, number, number, number] }]
              : []),
          ],
          width: "*",
        },
        {
          stack: [
            {
              table: {
                widths: ["*"],
                body: [[{ text: opinion, bold: true, color: "#ffffff", fillColor: accent, alignment: "center", fontSize: 9, margin: [8, 5, 8, 5] }]],
              },
              layout: "noBorders",
              margin: [0, 0, 0, 8],
            },
            { qr: validationUrl || payload.verificationCode, fit: 68, alignment: "right" },
            {
              text: payload.verificationCode,
              style: "small",
              alignment: "right",
              margin: [0, 4, 0, 0],
              characterSpacing: 0.3,
            },
          ],
          width: 118,
        },
      ],
      margin: [0, 0, 0, 0],
    },
    horizontalRule([0, 10, 0, 12]),
  ];
}

function checklistStatusNode(status: string): PdfNode {
  const statusConfig: Record<string, { label: string; color: string; icon: string }> = {
    CONFORME: { label: "OK Conforme", color: "#16a34a", icon: "" },
    NAO_CONFORME: { label: "Não conforme", color: "#dc2626", icon: "!" },
    NA: { label: "Não se aplica", color: "#64748b", icon: "" },
    PENDENTE: { label: "Pendente", color: "#f59e0b", icon: "" },
  };
  const config = statusConfig[status] ?? {
    label: getChecklistStatusLabel(status),
    color: "#64748b",
    icon: "•",
  };

  return {
    text: `${config.icon ? `${config.icon} ` : ""}${config.label}`,
    fontSize: 8,
    bold: true,
    color: config.color,
  };
}

function checklistBarChart(payload: LaudoPayload): PdfNode {
  const stats = summarizeLaudoChecklist(payload.checklist);
  const total = Math.max(stats.total, 1);
  const width = PAGE_CONTENT_WIDTH - 24;
  const segments = [
    { label: "Conforme", value: stats.conforme, color: "#16a34a" },
    { label: "Não conforme", value: stats.naoConforme, color: "#dc2626" },
    { label: "N/A", value: stats.naoAplicavel, color: SLATE },
    { label: "Pendente", value: stats.pendente, color: "#f59e0b" },
  ];

  let x = 0;
  const rects = segments.flatMap((segment) => {
    if (segment.value <= 0) return [];
    const rectWidth = Math.max(Math.round((segment.value / total) * width), 1);
    const node = { type: "rect", x, y: 0, w: rectWidth, h: 10, color: segment.color };
    x += rectWidth;
    return [node];
  });

  if (rects.length === 0) {
    rects.push({ type: "rect", x: 0, y: 0, w: width, h: 10, color: BORDER });
  }

  return {
    table: {
      widths: ["*"],
      body: [
        [
          {
            stack: [
              { text: "Resumo do checklist", fontSize: 7, color: SLATE, bold: true, characterSpacing: 0.4, margin: [0, 0, 0, 6] },
              { canvas: rects, margin: [0, 0, 0, 0] },
              {
                columns: segments.map((segment) => ({
                  text: `${segment.label}: ${segment.value}`,
                  fontSize: 7.5,
                  color: segment.color,
                  bold: true,
                  margin: [0, 6, 0, 0],
                })),
              },
            ],
            fillColor: SURFACE,
            margin: [12, 10, 12, 10],
          },
        ],
      ],
    },
    layout: {
      hLineColor: () => BORDER,
      vLineColor: () => BORDER,
      hLineWidth: () => 0.5,
      vLineWidth: () => 0.5,
      paddingLeft: () => 0,
      paddingRight: () => 0,
      paddingTop: () => 0,
      paddingBottom: () => 0,
    },
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
        color: item.status === "NAO_CONFORME" ? "#991b1b" : "#0f172a",
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

function photoNode(photo: LaudoPhoto, labelOverride?: string): PdfNode {
  const label = labelOverride ?? photo.label ?? PHOTO_CATEGORY_LABELS[photo.category] ?? photo.category.replace(/_/g, " ");

  if (!photo.dataUrl) {
    return {
      stack: [
        { text: label, bold: true, fontSize: 9 },
        { text: "Imagem indisponível para incorporação no PDF.", fontSize: 8, color: "#64748b" },
      ],
      margin: [0, 0, 0, 8],
    };
  }

  return {
    stack: [
      { image: photo.dataUrl, width: 242, height: 136, fit: [242, 136], alignment: "center" },
      { text: label, bold: true, fontSize: 8, color: "#075985", alignment: "center", margin: [0, 4, 0, 0] },
    ],
    margin: [0, 0, 0, 12],
  };
}

function buildPaintSection(payload: LaudoPayload): PdfNode[] {
  const photosByCategory = payload.photos.reduce<Record<string, LaudoPhoto[]>>((acc, photo) => {
    (acc[photo.category] ??= []).push(photo);
    return acc;
  }, {});
  const paintingPhotos = PAINT_PARTS.flatMap((part) =>
    (photosByCategory[part.photoCategory] ?? []).map((photo) => ({
      photo,
      label: `${part.number}, ${part.label}`,
    })),
  );

  if (paintingPhotos.length === 0) return [];

  return [
    premiumHeader("PINTURA"),
    ...photoPairs(
      paintingPhotos.map((item) => item.photo),
      paintingPhotos.map((item) => item.label),
    ),
  ];
}

function photoPairs(photos: LaudoPhoto[], labels?: string[]) {
  const pairs: PdfNode[][] = [];
  for (let index = 0; index < photos.length; index += 2) {
    pairs.push([
      photoNode(photos[index], labels?.[index]),
      photos[index + 1] ? photoNode(photos[index + 1], labels?.[index + 1]) : {},
    ]);
  }
  return pairs.map((columns) => ({ columns, columnGap: 12, margin: [0, 0, 0, 4] }));
}

function buildPhotoSection(payload: LaudoPayload, color: string): PdfNode[] {
  const photos = payload.photos;
  if (photos.length === 0) {
    return [
      sectionTitle("Registro fotográfico", color),
      { text: "Nenhuma foto registrada para esta vistoria.", color: "#64748b", margin: [0, 0, 0, 8] },
    ];
  }

  const documentation = photos.filter((photo) => photo.category === "DOCUMENTOS");
  const extras = photos.filter((photo) => photo.category === "EXTRAS");
  const paintCategories = new Set<string>(PAINT_PHOTO_CATEGORIES);
  const painting = photos.filter((photo) => paintCategories.has(photo.category));
  const standard = photos.filter(
    (photo) =>
      photo.category !== "DOCUMENTOS" &&
      photo.category !== "EXTRAS" &&
      !paintCategories.has(photo.category),
  );

  const nodes: PdfNode[] = [premiumHeader("REGISTRO FOTOGRÁFICO"), ...photoPairs(standard)];

  if (painting.length) nodes.push(...buildPaintSection(payload));

  if (documentation.length) {
    const sortedDocs = [...documentation].sort(
      (a, b) => new Date(a.created_at ?? 0).getTime() - new Date(b.created_at ?? 0).getTime(),
    );
    const docLabels = sortedDocs.map((_, index) => `Documento ${index + 1}`);
    nodes.push(premiumHeader("DOCUMENTAÇÃO DO VEÍCULO"), ...photoPairs(sortedDocs, docLabels));
  }

  if (extras.length) {
    const sortedExtras = [...extras].sort(
      (a, b) => new Date(a.created_at ?? 0).getTime() - new Date(b.created_at ?? 0).getTime(),
    );
    const extraLabels = sortedExtras.map((_, index) => `Foto extra ${index + 1}`);
    nodes.push(premiumHeader("FOTOS EXTRAS"), ...photoPairs(sortedExtras, extraLabels));
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
  const inspector = payload.inspector;
  const opinion = getOpinionLabel(inspection.opinion);
  const validationUrl = payload.validationUrl ?? "";
  const paintCategories = new Set<string>(PAINT_PHOTO_CATEGORIES);
  const featuredPhotos = payload.photos
    .filter((photo) => !paintCategories.has(photo.category) && photo.category !== "DOCUMENTOS" && photo.category !== "EXTRAS")
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
        inspector,
        formatDate,
        formatPhone,
        formatDocument,
      ),
    ),
    premiumHeader("DADOS DO VEÍCULO"),
    {
      columns: [
        {
          table: {
            widths: ["*"],
            body: [
              [buildBrandLogoCell(inspection.brand, payload.brandLogoDataUrl)],
            ],
          },
          layout: {
            hLineColor: () => "#0f172a",
            vLineColor: () => "#0f172a",
            hLineWidth: () => 0.8,
            vLineWidth: () => 0.8,
            paddingLeft: () => 6,
            paddingRight: () => 6,
            paddingTop: () => 6,
            paddingBottom: () => 6,
          },
          width: 95,
          margin: [0, 4, 10, 8],
        },
        {
          stack: [
            infoGrid(buildVehicleInfoRows(inspection)) ?? { text: "" },
          ],
        },
      ],
      margin: [0, 3, 0, 2],
    },
    ...(featuredPhotos.length ? photoPairs(featuredPhotos) : []),
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
            { text: "Assinatura do vistoriador", style: "muted" },
            { text: value(inspector?.full_name), bold: true, margin: [0, 18, 0, 0] },
            { text: value(inspector?.credential ?? inspector?.role), style: "small" },
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

