import { PHOTO_CATALOG } from "@/modules/torres-vistoria/domain/photos/photo-catalog";
import { groupPhotosBySection } from "@/modules/torres-vistoria/domain/photos/pdf-photo-layout";
import { formatDate, formatDocument, formatPhone } from "@/shared/lib/formatters";
import { formatChecklistObservationForPdf } from "@/modules/torres-vistoria/domain/checklist/checklist-issue-options";
import {
  getChecklistStatusPdfColor,
  getChecklistStatusPdfLabel,
  getChecklistStatusShortLabel,
} from "@/modules/torres-vistoria/domain/checklist/checklist-status";
import { ChecklistStatus } from "@/modules/torres-vistoria/domain/enums";
import {
  buildInspectionInfoRows,
  buildSaleMarketInfoRows,
  buildVehicleInfoRows,
  hasLaudoValue,
  hasSaleMarketSectionData,
} from "@/modules/torres-vistoria/domain/laudo/laudo-field-utils";
import { buildCoverPlatePdfNode } from "@/modules/torres-vistoria/domain/laudo/mercosul-plate-pdf";
import {
  getLaudoLegalParagraphs,
  type LaudoPayload,
} from "@/modules/torres-vistoria/domain/laudo/laudo-model";
import { summarizeVerificationCode } from "@/modules/torres-vistoria/domain/laudo/verification-code";
import {
  PDF_AUTHENTICITY,
  PDF_COLOR,
  PDF_COVER,
  PDF_FONT,
  PDF_LINE_HEIGHT,
  PDF_PAGE,
  PDF_SPACE,
  PDF_TRACKING,
  toneColor,
  type PdfNode,
} from "@/modules/torres-vistoria/domain/laudo/pdf/pdf-tokens";
import {
  attentionBanner,
  bulletList,
  codeBlock,
  dataTableLayout,
  labelValueBlock,
  labelValueGrid,
  metricRow,
  resultBadge,
  sectionBar,
  statusDot,
  statusLabel,
  subsectionHeading,
  tableHeaderCell,
} from "@/modules/torres-vistoria/domain/laudo/pdf/pdf-primitives";
import {
  buildChartLegendNode,
  buildDonutChartNode,
} from "@/modules/torres-vistoria/domain/laudo/pdf/pdf-charts";
import {
  buildPhotoGrid,
} from "@/modules/torres-vistoria/domain/laudo/pdf/photo-grid";
import {
  buildLaudoReportViewModel,
  type LaudoReportViewModel,
} from "@/modules/torres-vistoria/domain/laudo/pdf/laudo-report-view-model";
import { buildPaintSilhouetteNode } from "@/modules/torres-vistoria/domain/laudo/pdf/paint-silhouette";

const EMPTY_VALUE = "Não informado";
const LEGAL_HEADINGS = [
  "Natureza da vistoria",
  "Validade das informações",
  "Responsabilidades",
  "Financiamento e seguro",
];

function value(v: string | number | null | undefined): string {
  if (v === null || v === undefined || v === "") return EMPTY_VALUE;
  return String(v);
}

function checklistStatusDisplay(status: string): string {
  if (status === ChecklistStatus.NAO_CONFORME) return getChecklistStatusShortLabel(status);
  return getChecklistStatusPdfLabel(status);
}

function coverQrColumn(payload: LaudoPayload): PdfNode {
  const qrValue = payload.validationUrl || payload.verificationCode;
  return {
    width: PDF_COVER.qrSize + 4,
    stack: [
      { qr: qrValue, fit: PDF_COVER.qrSize, alignment: "right" },
      {
        text: "Valide este laudo",
        fontSize: PDF_FONT.micro,
        color: PDF_COLOR.muted,
        alignment: "right",
        margin: [0, 2, 0, 0],
      },
    ],
  };
}

function coverSummaryMetrics(view: LaudoReportViewModel): PdfNode {
  const items = [
    view.indicators[0],
    view.indicators[1],
    view.indicators[2],
    view.indicators[5],
  ].filter(Boolean) as LaudoReportViewModel["indicators"];

  if (view.stats.naoAplicavel > 0 && view.indicators[3]) items.push(view.indicators[3]);
  if (view.stats.pendente > 0 && view.indicators[4]) items.push(view.indicators[4]);

  return metricRow(
    items.map((item) => ({ label: item.label, value: item.value, accent: item.accent })),
    { margin: [0, PDF_SPACE.md, 0, 0] },
  );
}

function attentionBody(): string {
  const validity = getLaudoLegalParagraphs()[1] ?? getLaudoLegalParagraphs()[0] ?? "";
  const sentence = validity.match(/^.*?[.]/)?.[0]?.trim();
  return sentence || validity;
}

function buildCover(payload: LaudoPayload, view: LaudoReportViewModel): PdfNode[] {
  const inspection = payload.inspection;
  const accent = toneColor(view.opinionTone);
  const year = `${inspection.manufacture_year} / ${inspection.model_year}`;
  const when = `${formatDate(inspection.inspection_date)} às ${inspection.inspection_time.slice(0, 5)}`;
  const meta = [year, inspection.color, value(inspection.location), when].filter(Boolean).join("  ·  ");

  return [
    {
      columns: [
        {
          width: "*",
          stack: [
            {
              text: `${inspection.brand} / ${inspection.model}`,
              fontSize: PDF_FONT.display,
              bold: true,
              color: PDF_COLOR.navy,
              lineHeight: PDF_LINE_HEIGHT.tight,
            },
            {
              text: payload.laudoNumber,
              fontSize: PDF_FONT.small,
              bold: true,
              color: PDF_COLOR.navy,
              margin: [0, 1, 0, 0],
            },
            {
              text: meta,
              fontSize: PDF_FONT.small,
              color: PDF_COLOR.muted,
              margin: [0, 2, 0, 0],
            },
            {
              text: "RESULTADO",
              fontSize: PDF_FONT.micro,
              color: PDF_COLOR.muted,
              characterSpacing: PDF_TRACKING.wider,
              margin: [0, PDF_SPACE.md, 0, 2],
            },
            resultBadge(view.opinionLabel, { accent, width: PDF_PAGE.contentWidth }),
          ],
        },
        {
          width: "auto",
          stack: [
            buildCoverPlatePdfNode(inspection.plate, inspection),
            { ...coverQrColumn(payload), margin: [0, PDF_SPACE.sm, 0, 0] },
          ],
        },
      ],
      columnGap: PDF_SPACE.lg,
    },
    coverSummaryMetrics(view),
    {
      columns: [
        {
          width: 84,
          ...buildDonutChartNode(view.checklistDistribution, {
            size: 72,
            centerValue: String(view.stats.evaluated),
            centerLabel: "itens",
          }),
        },
        {
          width: "*",
          ...buildChartLegendNode(view.checklistDistribution, { includeEmpty: false, showPercentage: true }),
          margin: [PDF_SPACE.md, 6, 0, 0],
        },
      ],
      columnGap: PDF_SPACE.sm,
      margin: [0, PDF_SPACE.md, 0, 0],
    },
    attentionBanner("Atenção", attentionBody(), {
      width: PDF_PAGE.contentWidth,
      accent: view.primaryColor,
      margin: [0, PDF_SPACE.md, 0, 0],
    }),
  ];
}

function buildInspectionDataSection(
  payload: LaudoPayload,
  view: LaudoReportViewModel,
): PdfNode[] {
  const rows = buildInspectionInfoRows(
    payload.inspection,
    payload.company,
    formatDate,
    formatPhone,
    formatDocument,
  );
  const grid = labelValueGrid(rows, { columns: 3, dividers: true, margin: [0, PDF_SPACE.md, 0, 0] });
  if (!grid) return [];

  return [
    sectionBar("Dados da vistoria", {
      accent: view.primaryColor,
      width: PDF_PAGE.contentWidth,
      margin: [0, 0, 0, PDF_SPACE.lg],
    }),
    grid,
  ];
}

function buildVehicleDataSection(payload: LaudoPayload, view: LaudoReportViewModel): PdfNode[] {
  const grid = labelValueGrid(buildVehicleInfoRows(payload.inspection), {
    columns: 3,
    dividers: true,
    margin: [0, PDF_SPACE.md, 0, 0],
  });

  return [
    sectionBar("Veículo", {
      accent: view.primaryColor,
      width: PDF_PAGE.contentWidth,
    }),
    ...(payload.brandLogoDataUrl
      ? [
          {
            image: payload.brandLogoDataUrl,
            fit: [56, 24],
            alignment: "left" as const,
            margin: [0, 0, 0, PDF_SPACE.xs],
          },
        ]
      : []),
    grid ?? { text: "" },
  ];
}

function buildApontamentosSection(view: LaudoReportViewModel): PdfNode[] {
  if (view.apontamentos.length === 0) return [];

  return [
    sectionBar("Apontamentos identificados", {
      accent: toneColor(view.opinionTone),
      width: PDF_PAGE.contentWidth,
    }),
    ...view.apontamentos.map((apontamento, index) => ({
      unbreakable: true,
      columns: [
        {
          width: 32,
          text: String(index + 1).padStart(2, "0"),
          fontSize: PDF_FONT.h2,
          bold: true,
          color: PDF_COLOR.navy,
        },
        {
          width: "*",
          stack: [
            {
              text: apontamento.categoryLabel.toUpperCase(),
              fontSize: PDF_FONT.micro,
              color: PDF_COLOR.muted,
              characterSpacing: PDF_TRACKING.wide,
            },
            {
              text: apontamento.itemName,
              fontSize: PDF_FONT.bodyLarge,
              bold: true,
              color: PDF_COLOR.text,
              margin: [0, 2, 0, 0],
            },
            ...(apontamento.note
              ? [
                  {
                    text: apontamento.note,
                    fontSize: PDF_FONT.body,
                    color: PDF_COLOR.warning,
                    margin: [0, 2, 0, 0],
                  },
                ]
              : []),
          ],
        },
      ],
      columnGap: PDF_SPACE.md,
      margin: [0, 0, 0, PDF_SPACE.lg],
    })),
  ];
}

function buildSaleMarketSection(
  inspection: LaudoPayload["inspection"],
  view: LaudoReportViewModel,
): PdfNode[] {
  if (!hasSaleMarketSectionData(inspection)) return [];
  const rows = buildSaleMarketInfoRows(inspection);
  const grid = labelValueGrid(rows, { columns: 3, margin: [0, PDF_SPACE.md, 0, 0] });
  if (!grid) return [];

  return [
    sectionBar("Venda, justiça e mercado", {
      accent: view.primaryColor,
      width: PDF_PAGE.contentWidth,
    }),
    grid,
  ];
}

type ChecklistCategoryVm = LaudoReportViewModel["categories"][number];
type ChecklistItemVm = ChecklistCategoryVm["items"][number];

/** Preenche de cima para baixo, depois a próxima coluna — sem buracos de grade. */
function splitNewspaperColumns<T>(items: T[], columnCount: number): T[][] {
  if (columnCount <= 1 || items.length === 0) return items.length ? [items] : [];
  const perColumn = Math.ceil(items.length / columnCount);
  const columns: T[][] = [];
  for (let index = 0; index < columnCount; index += 1) {
    const slice = items.slice(index * perColumn, (index + 1) * perColumn);
    if (slice.length > 0) columns.push(slice);
  }
  return columns;
}

function checklistItemLine(item: ChecklistItemVm): PdfNode {
  const isApontamento = item.status === ChecklistStatus.NAO_CONFORME;
  const observation = formatChecklistObservationForPdf(item.status, item.notes);
  const color = getChecklistStatusPdfColor(item.status);
  const muted = item.status !== ChecklistStatus.CONFORME && !isApontamento;

  return {
    columns: [
      statusDot(color, isApontamento ? 5 : 4),
      {
        width: "*",
        fontSize: PDF_FONT.small,
        color: muted ? PDF_COLOR.muted : PDF_COLOR.text,
        bold: isApontamento,
        text: observation
          ? [
              {
                text: item.item_name,
                bold: true,
                fontSize: PDF_FONT.small,
                color: PDF_COLOR.text,
              },
              {
                text: ` — ${observation}`,
                fontSize: PDF_FONT.micro,
                color: PDF_COLOR.warning,
              },
            ]
          : item.item_name,
      },
    ],
    columnGap: 4,
    margin: [0, 0, 0, 1.5],
  };
}

function categoryChecklistBlock(
  category: ChecklistCategoryVm,
  accent: string,
  itemColumns: number,
): PdfNode {
  const columns = splitNewspaperColumns(category.items, itemColumns);

  return {
    stack: [
      subsectionHeading(category.label, {
        accent,
        margin: [0, 0, 0, 3],
      }),
      columns.length <= 1
        ? { stack: category.items.map(checklistItemLine) }
        : {
            columns: columns.map((columnItems) => ({
              width: "*",
              stack: columnItems.map(checklistItemLine),
            })),
            columnGap: PDF_SPACE.xl,
          },
    ],
  };
}

function compactChecklistItems(
  category: ChecklistCategoryVm,
  accent: string,
  itemColumns: number,
): PdfNode {
  return {
    unbreakable: true,
    margin: [0, PDF_SPACE.sm, 0, PDF_SPACE.xs],
    ...categoryChecklistBlock(category, accent, itemColumns),
  };
}

function buildChecklistSection(view: LaudoReportViewModel): PdfNode[] {
  if (view.categories.length === 0) {
    return [
      sectionBar("Checklist técnico", {
        accent: view.primaryColor,
        width: PDF_PAGE.contentWidth,
      }),
      { text: "Nenhum item de checklist registrado nesta vistoria.", color: PDF_COLOR.muted },
    ];
  }

  const nodes: PdfNode[] = [
    sectionBar("Checklist técnico", {
      accent: view.primaryColor,
      width: PDF_PAGE.contentWidth,
    }),
  ];

  const accent = view.primaryColor;
  const wideThreshold = 7;
  const categories = view.categories;
  let index = 0;

  while (index < categories.length) {
    const current = categories[index];
    const next = categories[index + 1];

    if (current.items.length >= wideThreshold) {
      nodes.push(compactChecklistItems(current, accent, 2));
      index += 1;
      continue;
    }

    if (next && next.items.length < wideThreshold) {
      nodes.push({
        unbreakable: true,
        margin: [0, PDF_SPACE.sm, 0, PDF_SPACE.xs],
        columns: [
          { width: "*", ...categoryChecklistBlock(current, accent, 1) },
          { width: "*", ...categoryChecklistBlock(next, accent, 1) },
        ],
        columnGap: PDF_SPACE.xxl,
      });
      index += 2;
      continue;
    }

    nodes.push(compactChecklistItems(current, accent, current.items.length >= 4 ? 2 : 1));
    index += 1;
  }

  return nodes;
}

function buildPhotoSection(payload: LaudoPayload, view: LaudoReportViewModel): PdfNode[] {
  const photos = payload.photos;

  if (photos.length === 0) {
    return [
      sectionBar("Registro fotográfico", {
        accent: view.primaryColor,
        width: PDF_PAGE.contentWidth,
      }),
      { text: "Nenhuma foto registrada para esta vistoria.", color: PDF_COLOR.muted },
    ];
  }

  const grouped = groupPhotosBySection(photos);
  const nodes: PdfNode[] = [
    sectionBar("Registro fotográfico", {
      accent: view.primaryColor,
      width: PDF_PAGE.contentWidth,
    }),
  ];

  for (const section of PHOTO_CATALOG) {
    const sectionPhotos = grouped.get(section.key);
    if (!sectionPhotos?.length) continue;

    nodes.push(
      subsectionHeading(section.name, {
        accent: view.primaryColor,
        margin: [0, PDF_SPACE.sm, 0, 2],
      }),
      ...buildPhotoGrid(sectionPhotos, {
        accent: view.primaryColor,
        contentWidth: PDF_PAGE.contentWidth,
      }),
    );
  }

  return nodes;
}

function buildPaintSection(view: LaudoReportViewModel, payload: LaudoPayload): PdfNode[] {
  if (!view.hasPaintAnalysisData) return [];

  const nodes: PdfNode[] = [
    sectionBar("Análise de pintura e estrutura", {
      accent: view.primaryColor,
      width: PDF_PAGE.contentWidth,
    }),
    buildPaintSilhouetteNode(view.paintZones, payload.vehicleTopViewDataUrl),
  ];

  if (view.paintChecklistItems.length > 0) {
    nodes.push(
      subsectionHeading("Itens de pintura", {
        accent: view.primaryColor,
        margin: [0, PDF_SPACE.md, 0, 2],
      }),
      {
        table: {
          headerRows: 1,
          widths: ["72%", "28%"],
          body: [
            [tableHeaderCell("Item"), tableHeaderCell("Status")],
            ...view.paintChecklistItems.map((item) => {
              const observation = formatChecklistObservationForPdf(item.status, item.notes);
              return [
                {
                  stack: [
                    { text: item.item_name, fontSize: PDF_FONT.body, color: PDF_COLOR.text },
                    ...(observation
                      ? [{ text: observation, fontSize: PDF_FONT.micro, color: PDF_COLOR.warning, margin: [0, 1, 0, 0] }]
                      : []),
                  ],
                },
                statusLabel(
                  checklistStatusDisplay(item.status).toUpperCase(),
                  getChecklistStatusPdfColor(item.status),
                ),
              ];
            }),
          ],
        },
        layout: dataTableLayout(),
      },
    );
  }

  return nodes;
}

function buildOpinionSection(
  inspection: LaudoPayload["inspection"],
  view: LaudoReportViewModel,
): PdfNode[] {
  const notes = inspection.technical_notes?.trim();
  if (!hasLaudoValue(notes)) return [];

  return [
    sectionBar("Parecer técnico", {
      accent: view.primaryColor,
      width: PDF_PAGE.contentWidth,
    }),
    {
      text: notes,
      fontSize: PDF_FONT.body,
      color: PDF_COLOR.text,
      lineHeight: PDF_LINE_HEIGHT.normal,
      alignment: "justify",
      margin: [0, PDF_SPACE.xs, 0, 0],
    },
  ];
}

function buildConclusionSection(view: LaudoReportViewModel): PdfNode[] {
  const photoNotes = view.conclusionHighlights.filter((line) => line.includes("Nenhuma fotografia"));

  return [
    sectionBar("Conclusão da vistoria", {
      accent: view.primaryColor,
      width: PDF_PAGE.contentWidth,
    }),
    resultBadge(view.opinionLabel, {
      accent: toneColor(view.opinionTone),
      width: PDF_PAGE.contentWidth,
      fontSize: PDF_FONT.result,
    }),
    ...(photoNotes.length > 0 ? [bulletList(photoNotes, { color: PDF_COLOR.navy, margin: [0, PDF_SPACE.sm, 0, 0] })] : []),
  ];
}

function buildAuthenticitySection(payload: LaudoPayload, view: LaudoReportViewModel): PdfNode[] {
  const qrValue = payload.validationUrl || payload.verificationCode;
  const inspector = payload.inspector;

  return [
    sectionBar("Autenticidade do laudo", {
      accent: view.primaryColor,
      width: PDF_PAGE.contentWidth,
    }),
    {
      unbreakable: true,
      columns: [
        {
          width: PDF_AUTHENTICITY.qrSize + 16,
          stack: [
            { qr: qrValue, fit: PDF_AUTHENTICITY.qrSize },
            {
              text: "Validação pública",
              fontSize: PDF_FONT.micro,
              color: PDF_COLOR.muted,
              alignment: "center",
              margin: [0, PDF_SPACE.sm, 0, 0],
            },
          ],
        },
        {
          width: "*",
          stack: [
            labelValueBlock("Código de autenticidade", payload.verificationCode, {
              valueSize: PDF_FONT.h1,
              valueColor: PDF_COLOR.navy,
              margin: [0, 0, 0, PDF_SPACE.lg],
            }),
            {
              text: "HASH SHA-256",
              fontSize: PDF_FONT.micro,
              color: PDF_COLOR.muted,
              characterSpacing: PDF_TRACKING.wide,
              margin: [0, 0, 0, PDF_SPACE.xs],
            },
            codeBlock(payload.integrityHash, { fontSize: PDF_FONT.micro }),
            {
              text: "Documento verificável na plataforma Torres.",
              fontSize: PDF_FONT.small,
              color: PDF_COLOR.muted,
              margin: [0, PDF_SPACE.md, 0, 0],
            },
            ...(payload.validationUrl
              ? [
                  {
                    text: payload.validationUrl,
                    fontSize: PDF_FONT.small,
                    color: PDF_COLOR.navy,
                    margin: [0, 2, 0, 0],
                  },
                ]
              : []),
            ...(inspector?.full_name
              ? [
                  labelValueBlock("Vistoriador responsável", inspector.full_name, {
                    margin: [0, PDF_SPACE.md, 0, 0],
                  }),
                  ...(inspector.credential
                    ? [
                        {
                          text: inspector.credential,
                          fontSize: PDF_FONT.micro,
                          color: PDF_COLOR.muted,
                          margin: [0, 2, 0, 0],
                        },
                      ]
                    : []),
                ]
              : []),
          ],
        },
      ],
      columnGap: PDF_SPACE.xl,
    },
  ];
}

function buildLegalSection(view: LaudoReportViewModel): PdfNode[] {
  const paragraphs = getLaudoLegalParagraphs();

  return [
    sectionBar("Informações jurídicas", {
      accent: view.primaryColor,
      width: PDF_PAGE.contentWidth,
    }),
    ...paragraphs.map((paragraph, index) => ({
      stack: [
        {
          text: (LEGAL_HEADINGS[index] ?? `Informativo ${index + 1}`).toUpperCase(),
          fontSize: PDF_FONT.micro,
          bold: true,
          color: PDF_COLOR.navy,
          characterSpacing: PDF_TRACKING.wide,
          margin: [0, index === 0 ? 0 : PDF_SPACE.sm, 0, 1],
        },
        {
          text: paragraph,
          fontSize: PDF_FONT.small,
          alignment: "justify" as const,
          color: PDF_COLOR.text,
          lineHeight: PDF_LINE_HEIGHT.tight,
        },
      ],
    })),
  ];
}

function buildSignatureRow(payload: LaudoPayload): PdfNode {
  const company = payload.company;
  return {
    columns: [
      {
        stack: [
          {
            text: "EMPRESA RESPONSÁVEL",
            fontSize: PDF_FONT.micro,
            color: PDF_COLOR.muted,
            characterSpacing: PDF_TRACKING.wide,
          },
          {
            text: value(company?.name?.trim() || "Torres Vistoria"),
            bold: true,
            fontSize: PDF_FONT.bodyLarge,
            color: PDF_COLOR.navy,
            margin: [0, PDF_SPACE.sm, 0, 0],
          },
          ...(company?.document
            ? [{ text: formatDocument(company.document), fontSize: PDF_FONT.small, color: PDF_COLOR.muted }]
            : []),
        ],
      },
      {
        stack: [
          {
            text: "VALIDAÇÃO PÚBLICA",
            fontSize: PDF_FONT.micro,
            color: PDF_COLOR.muted,
            alignment: "right",
            characterSpacing: PDF_TRACKING.wide,
          },
          {
            text: payload.validationUrl || "Disponível pelo código do laudo",
            fontSize: PDF_FONT.small,
            alignment: "right",
            color: PDF_COLOR.text,
            margin: [0, PDF_SPACE.sm, 0, 0],
          },
        ],
      },
    ],
    margin: [0, PDF_SPACE.md, 0, 0],
  };
}

export function buildLaudoDocDefinition(payload: LaudoPayload): Record<string, unknown> {
  const view = buildLaudoReportViewModel(payload);
  const company = payload.company;
  const issuedAt = formatDate(payload.generatedAt);
  const codeSummary = summarizeVerificationCode(payload.verificationCode);
  const footerBrand = company?.name?.trim() || "Torres Vistoria";

  const content: PdfNode[] = [
    ...buildCover(payload, view),
    ...buildInspectionDataSection(payload, view),
    ...buildVehicleDataSection(payload, view),
    ...buildSaleMarketSection(payload.inspection, view),
    ...buildApontamentosSection(view),
    ...buildChecklistSection(view),
    ...buildPhotoSection(payload, view),
    ...buildPaintSection(view, payload),
    ...buildOpinionSection(payload.inspection, view),
    ...buildConclusionSection(view),
    ...buildAuthenticitySection(payload, view),
    ...buildLegalSection(view),
    buildSignatureRow(payload),
  ];

  return {
    pageSize: PDF_PAGE.size,
    pageMargins: PDF_PAGE.margins,
    content,
    header: (currentPage: number, pageCount: number) => ({
      columns: [
        {
          stack: [
            {
              text: footerBrand.toUpperCase(),
              fontSize: PDF_FONT.micro,
              bold: true,
              color: PDF_COLOR.navy,
              characterSpacing: PDF_TRACKING.wide,
            },
            {
              text: `Laudo Cautelar Veicular · ${payload.laudoNumber}`,
              fontSize: PDF_FONT.micro,
              color: PDF_COLOR.muted,
              margin: [0, 1, 0, 0],
            },
          ],
          margin: [PDF_PAGE.margins[0], 8, 0, 0],
        },
        {
          text: `Página ${currentPage} / ${pageCount}`,
          fontSize: PDF_FONT.micro,
          color: PDF_COLOR.muted,
          alignment: "right",
          margin: [0, 12, PDF_PAGE.margins[2], 0],
        },
      ],
    }),
    footer: () => ({
      stack: [
        {
          canvas: [
            {
              type: "line",
              x1: PDF_PAGE.margins[0],
              y1: 0,
              x2: PDF_PAGE.margins[0] + PDF_PAGE.contentWidth,
              y2: 0,
              lineWidth: 0.4,
              lineColor: PDF_COLOR.border,
            },
          ],
        },
        {
          text: `${codeSummary}  ·  ${issuedAt}`,
          fontSize: PDF_FONT.micro,
          color: PDF_COLOR.muted,
          margin: [PDF_PAGE.margins[0], 4, PDF_PAGE.margins[2], 0],
        },
      ],
    }),
    defaultStyle: {
      fontSize: PDF_FONT.body,
      color: PDF_COLOR.text,
    },
  };
}
