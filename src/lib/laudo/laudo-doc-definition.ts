import { PHOTO_CATEGORY_LABELS } from "@/components/photos/photo-categories";
import { getChecklistCategoryLabel, getChecklistStatusLabel } from "@/lib/checklist-catalog";
import { formatDate, formatDocument, formatKM, formatPhone, formatPlate } from "@/lib/formatters";
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

function value(v: string | number | null | undefined): string {
  if (v === null || v === undefined || v === "") return EMPTY_VALUE;
  return String(v);
}

function extra(inspection: LaudoPayload["inspection"], key: string): string | null {
  const data = inspection as unknown as Record<string, unknown>;
  const result = data[key];
  return typeof result === "string" && result.trim() ? result : null;
}

function sectionTitle(text: string, color: string): PdfNode {
  return {
    text,
    color,
    bold: true,
    fontSize: 12,
    margin: [0, 16, 0, 6],
  };
}

function infoTable(rows: [string, string][]): PdfNode {
  return {
    table: {
      widths: ["32%", "68%"],
      body: rows.map(([label, content]) => [
        { text: label, style: "tableLabel" },
        { text: content || EMPTY_VALUE, style: "tableValue" },
      ]),
    },
    layout: "lightHorizontalLines",
    margin: [0, 0, 0, 8],
  };
}

function statCard(label: string, valueText: string, color: string): PdfNode {
  return {
    stack: [
      { text: label.toUpperCase(), fontSize: 7, color: "#64748b", bold: true },
      { text: valueText, fontSize: 16, bold: true, color, margin: [0, 3, 0, 0] },
    ],
    fillColor: "#f8fafc",
    margin: [0, 0, 0, 0],
  };
}

function checklistBarChart(payload: LaudoPayload): PdfNode {
  const stats = summarizeLaudoChecklist(payload.checklist);
  const total = Math.max(stats.total, 1);
  const width = 420;
  const segments = [
    { label: "Conforme", value: stats.conforme, color: "#16a34a" },
    { label: "Não conforme", value: stats.naoConforme, color: "#dc2626" },
    { label: "N/A", value: stats.naoAplicavel, color: "#64748b" },
    { label: "Pendente", value: stats.pendente, color: "#f59e0b" },
  ];

  let x = 0;
  const rects = segments.map((segment) => {
    const rectWidth = Math.round((segment.value / total) * width);
    const node = {
      type: "rect",
      x,
      y: 0,
      w: rectWidth,
      h: 12,
      color: segment.color,
    };
    x += rectWidth;
    return node;
  });

  return {
    stack: [
      { canvas: rects },
      {
        columns: segments.map((segment) => ({
          text: `${segment.label}: ${segment.value}`,
          fontSize: 8,
          color: segment.color,
          margin: [0, 5, 0, 0],
        })),
      },
    ],
    margin: [0, 4, 0, 8],
  };
}

function buildChecklistSection(payload: LaudoPayload, color: string): PdfNode[] {
  const grouped = payload.checklist.reduce<Record<string, typeof payload.checklist>>((acc, item) => {
    (acc[item.category] ??= []).push(item);
    return acc;
  }, {});

  return Object.entries(grouped).flatMap(([category, items]) => {
    const rows = items.map((item) => [
      { text: item.item_name, fontSize: 8 },
      { text: getChecklistStatusLabel(item.status), fontSize: 8, bold: true },
      { text: item.notes || "—", fontSize: 8 },
    ]);

    return [
      sectionTitle(getChecklistCategoryLabel(category), color),
      {
        table: {
          headerRows: 1,
          widths: ["38%", "18%", "44%"],
          body: [
            [
              { text: "Item avaliado", style: "tableHeader" },
              { text: "Status", style: "tableHeader" },
              { text: "Observação técnica", style: "tableHeader" },
            ],
            ...rows,
          ],
        },
        layout: "lightHorizontalLines",
      },
    ];
  });
}

function photoNode(photo: LaudoPhoto): PdfNode {
  const label = photo.label ?? PHOTO_CATEGORY_LABELS[photo.category] ?? photo.category.replace(/_/g, " ");
  const geo =
    photo.latitude != null && photo.longitude != null
      ? `Geo: ${photo.latitude.toFixed(5)}, ${photo.longitude.toFixed(5)}`
      : "Geo: não registrada";

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
      { image: photo.dataUrl, width: 240, height: 150, fit: [240, 150], alignment: "center" },
      { text: label, bold: true, fontSize: 8, margin: [0, 4, 0, 0] },
      { text: `${formatDate(photo.created_at)} · ${geo}`, fontSize: 7, color: "#64748b" },
    ],
    margin: [0, 0, 0, 12],
  };
}

function buildPhotoSection(photos: LaudoPhoto[], color: string): PdfNode[] {
  if (photos.length === 0) {
    return [
      sectionTitle("Registro fotográfico", color),
      { text: "Nenhuma foto registrada para esta vistoria.", color: "#64748b", margin: [0, 0, 0, 8] },
    ];
  }

  const pairs: PdfNode[][] = [];
  for (let index = 0; index < photos.length; index += 2) {
    pairs.push([photoNode(photos[index]), photos[index + 1] ? photoNode(photos[index + 1]) : {}]);
  }

  return [
    sectionTitle("Registro fotográfico completo", color),
    ...pairs.map((columns) => ({ columns, columnGap: 12, margin: [0, 0, 0, 4] })),
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

  const content: PdfNode[] = [
    {
      columns: [
        {
          stack: [
            { text: "TORRES VISTORIAS", style: "brand", color },
            { text: "Laudo cautelar veicular", style: "muted" },
            { text: `Nº ${inspection.inspection_number}`, fontSize: 12, bold: true, margin: [0, 8, 0, 0] },
          ],
        },
        {
          stack: [
            { qr: validationUrl || payload.verificationCode, fit: 72, alignment: "right" },
            { text: payload.verificationCode, style: "small", alignment: "right", margin: [0, 4, 0, 0] },
          ],
          width: 90,
        },
      ],
    },
    {
      text: opinion,
      alignment: "center",
      color: "#ffffff",
      fillColor: opinion.includes("REPROVADO") ? "#dc2626" : opinion.includes("APONTAMENTO") ? "#f97316" : "#16a34a",
      bold: true,
      fontSize: 15,
      margin: [0, 16, 0, 10],
    },
    {
      columns: [
        statCard("Checklist", `${stats.evaluated}/${stats.total}`, color),
        statCard("Não Conforme", String(stats.naoConforme), "#dc2626"),
        statCard("Fotos", String(payload.photos.length), "#2563eb"),
        statCard("Risco", stats.riskLevel, stats.riskLevel === "ALTO" ? "#dc2626" : stats.riskLevel === "MEDIO" ? "#f97316" : "#16a34a"),
      ],
      columnGap: 8,
      margin: [0, 0, 0, 10],
    },
    checklistBarChart(payload),
    sectionTitle("Dados da vistoria", color),
    infoTable([
      ["Empresa", value(company?.name)],
      ["CPF/CNPJ", formatDocument(company?.document)],
      ["Telefone", formatPhone(company?.phone)],
      ["Data e hora", `${formatDate(inspection.inspection_date)} às ${inspection.inspection_time.slice(0, 5)}`],
      ["Local", inspection.location],
      ["Vistoriador", value(inspector?.full_name)],
      ["Finalidade", value(extra(inspection, "inspection_purpose"))],
      ["Solicitante/Cliente", inspection.client_name],
    ]),
    sectionTitle("Dados completos do veículo", color),
    infoTable([
      ["Placa", formatPlate(inspection.plate)],
      ["UF do veículo", value(extra(inspection, "vehicle_uf"))],
      ["Chassi", inspection.chassis],
      ["Renavam", value(inspection.renavam)],
      ["Motor", value(extra(inspection, "motor_number"))],
      ["Marca / Modelo", `${inspection.brand} / ${inspection.model}`],
      ["Versão", value(inspection.version)],
      ["Ano fab./mod.", `${inspection.manufacture_year} / ${inspection.model_year}`],
      ["Cor", inspection.color],
      ["Combustível", inspection.fuel],
      ["Quilometragem", formatKM(inspection.mileage)],
      ["Município/UF", value(extra(inspection, "registration_city_uf"))],
      ["Categoria / espécie", [extra(inspection, "vehicle_category"), extra(inspection, "vehicle_species")].filter(Boolean).join(" / ") || EMPTY_VALUE],
    ]),
    sectionTitle("Parecer técnico e observações", color),
    {
      text: inspection.technical_notes || "Sem observações técnicas complementares.",
      fontSize: 10,
      margin: [0, 0, 0, 8],
    },
    ...buildChecklistSection(payload, color),
    { text: "", pageBreak: "before" },
    ...buildPhotoSection(payload.photos, color),
    sectionTitle("Informativo jurídico", color),
    { text: getLaudoLegalFooter(payload.settings), fontSize: 8, alignment: "justify", margin: [0, 0, 0, 12] },
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
      columns: [
        { text: "Torres Vistorias · Laudo cautelar veicular", style: "small", margin: [36, 0, 0, 0] },
        { text: `Página ${currentPage} de ${pageCount}`, style: "small", alignment: "right", margin: [0, 0, 36, 0] },
      ],
    }),
    styles: {
      brand: { fontSize: 20, bold: true },
      muted: { fontSize: 9, color: "#64748b" },
      small: { fontSize: 7, color: "#64748b" },
      tableHeader: { fontSize: 8, bold: true, fillColor: "#f1f5f9" },
      tableLabel: { fontSize: 8, color: "#475569", bold: true },
      tableValue: { fontSize: 9 },
    },
    defaultStyle: { fontSize: 9, color: "#0f172a" },
  };
}

